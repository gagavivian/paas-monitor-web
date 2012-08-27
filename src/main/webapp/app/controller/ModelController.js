Ext.define('PaaSMonitor.controller.ModelController', {
    extend: 'Ext.app.Controller',

    views: [
        'ModelDefPanel',
        'ModelView.ModelViewPanel',
        'ModelView.MetricWindow'       
    ],

    refs: [
        {
            ref: 'defPanel',
            selector: 'modeldefpanel'
        },
        {
            ref: 'viewPanel',
            selector: 'modelviewpanel'
        },
        {
            ref: 'metricWindow',
            selector: 'showmetric',
            //此处一定要加xtype，否则无法创建出正确的component类型
            xtype: 'showmetric',
            autoCreate: true            
        }        
    ],

    init: function(application) {
        this.control({			
            'modeldefpanel' : {
                activate : this.loadModelDef
            },
            'modelviewpanel' : {
                activate : this.loadRuntimeModel
            }
        });

        if(!mxClient.isBrowserSupported()) {
            // Displays an error message if the browser is
            // not supported.
            mxUtils.error('Browser is not supported!', 200, false);
        } else {
            // Creates the graph editor inside the given container
            this.viewEditor = this.initViewEditor(document.getElementById('runtimemodel_graph_container'));
            this.defEditor = this.initDefEditor(document.getElementById('graphContainer'),
            document.getElementById('outlineContainer'),
            document.getElementById('toolbarContainer'),
            document.getElementById('sidebarContainer'),
            document.getElementById('statusContainer'));
        }


    },

    loadModelDef: function() {
        var graph = this.defEditor.graph;
        var loadMask = new Ext.LoadMask(this.getDefPanel(), {msg:"Loading"});
        loadMask.show();
        mxUtils.get('model.xml', function(req){
            loadMask.hide();
            var root = req.getDocumentElement();
            var dec = new mxCodec(root);
            graph.getModel().beginUpdate();
            dec.decode(root, graph.getModel());
            graph.getModel().endUpdate();
        });



    },

    loadRuntimeModel: function() {
        var generateModel = this.generateModel;
        var controller = this;
        var loadMask = new Ext.LoadMask(this.getViewPanel(), {msg:"Loading"});
        loadMask.show();
        Ext.Ajax.request({
            url: 'model/getmodel',   
            timeout: 90000,
            success: function(response){
                var json = response.responseText;
                var phyms = Ext.decode(json); 
                if(phyms.length != 0){
                    generateModel(phyms,controller);
                }else{
                    Ext.MessageBox.alert('提示','当前没有待监测对象！');
                }

                loadMask.hide();
            },
            failure: function(response){
                loadMask.hide();
                Ext.MessageBox.alert('错误','无法加载当前的运行时模型');
            }
        });
    },

    generateModel: function(modelData, controller) {
        // Get the created graph from the controller
        var editor = controller.viewEditor;
        var graph = editor.graph;
        var model = graph.model;

        graph.removeCells(graph.getChildVertices(graph.getDefaultParent()));

        // constructToolbar(toolbar, graph);

        var hierarchicalLayout = new mxHierarchicalLayout(graph, mxConstants.DIRECTION_WEST);
        hierarchicalLayout.intraCellSpacing = 50;
        hierarchicalLayout.interRankCellSpacing = 80;
        var treeLayout = new mxCompactTreeLayout(graph);
        treeLayout.intraCellSpacing = 50;

        var parent = graph.getDefaultParent();

        // Load cells and layouts the graph
        graph.getModel().beginUpdate();
        try {
            controller.parseModelData(graph, modelData);
            hierarchicalLayout.execute(parent);
        } finally {
            graph.getModel().endUpdate();
        }
    },

    initViewEditor: function(container) {
        // Creates the graph inside the given container
        var controller = this;
        var editor = new mxEditor();
        var graph = editor.graph;

        editor.setGraphContainer(container);

        if(mxClient.IS_IE) {
            new mxDivResizer(container);
        }

        // Adds rubberband selection
        //能够用画框的方式选中element
        new mxRubberband(graph);

        this.configureStylesheet(graph);

        var hierarchicalLayout = new mxHierarchicalLayout(graph, mxConstants.DIRECTION_WEST);
        hierarchicalLayout.intraCellSpacing = 50;
        hierarchicalLayout.interRankCellSpacing = 80;

        var parent = graph.getDefaultParent();

        //返回cell的value的name，作为cell的label
        graph.convertValueToString = function(cell) {
            // if(cell.value != null && cell.value.httpPort != null) {
                // return cell.value.httpPort + ':' + cell.value.status;
            // }
            if(cell.value != null && cell.value.ip != null) {
                return cell.value.ip;
            }
            if(cell.value != null && cell.value.resourcePrototype != null) {
                return cell.value.resourcePrototype.name;
            }
            return mxGraph.prototype.convertValueToString.apply(this, arguments);
            // "supercall"
        };

        graph.isHtmlLabel = function(cell) {
            return !this.isSwimlane(cell) && !this.model.isEdge(cell);
        };

        graph.getLabel = function(cell) {
            if(this.isHtmlLabel(cell)) {
                if(cell.value != null && cell.value.httpPort != null) {
                    var label = '';
                    label += '<div>' + mxUtils.htmlEntities(cell.value.httpPort, false) + '</div>' + '<span style="color:red; font-style: italic">' + mxUtils.htmlEntities(cell.value.status, false) + '</span>';
                    return label;
                }
                if(cell.value != null && cell.value.ip != null) {
	                return cell.value.ip;
	            }
                if(cell.value != null && cell.value.resourcePrototype != null) {
	                return cell.value.resourcePrototype.name;
	            }
            }

            return mxGraph.prototype.getLabel.apply(this, arguments);
            // "supercall"
        };

        graph.getTooltip = function(state) {
        	var result = '';
        	var properties = state.cell.value.resourcePropertyValues;
        	if(properties != null){
        		for( var i=0; i<properties.length; i++){
	        		result += '<div><span style="font-weight: bold">' + properties[i].resourcePropertyKey.key + ' : </span>' + properties[i].value + '</div>';
	        	}
	        	return result;
        	}
        	return mxGraph.prototype.getTooltip.apply(this, arguments);
	        // "supercall"
	    };
	
	    graph.isCellEditable = function(cell) {
	        return false;
	    };

	    graph.addListener(mxEvent.DOUBLE_CLICK, function(sender, evt) {
	        var cell = evt.getProperty('cell');
	        if(cell.isVertex()) {
	            var style = cell.style;
	            var children = controller.getChildren(cell);
	            if(children.length === 0) {
	                controller.expandChildren(this, cell);
	                //这个地方的layout到底如何设置，还需要进一步完善
	                hierarchicalLayout.execute(parent);
	            } else {
	                controller.foldChildren(this, cell);
	            }
	        }
	
	    });
	    
	    
	    // Installs a popupmenu handler using local function (see below).
        graph.panningHandler.factoryMethod = function(menu, cell, evt) {
            controller.createMoniteeMenu(editor, graph, menu, cell, evt);
        };        
        
        
    	return editor;
    },
    
    
    
	createMoniteeMenu: function(editor, graph, menu, cell, evt) {
		var controller = this;
		if (cell != null) {
			if (graph.isHtmlLabel(cell)) {
				menu.addItem('Show Monitoring Statistics', 'images/properties.gif', function() {
					//editor.execute('metric', cell);	
					controller.showMetrics();			
				});
				// menu.addSeparator();

			} else {
				menu.addItem('Add Attribute', 'images/plus.png', function() {
					editor.execute('add', cell);
				});

				menu.addSeparator();
			}

			// menu.addItem('Delete', 'images/delete2.png', function() {
				// editor.execute('delete', cell);
			// });
		}
	},
	
	
	showMetrics: function(graph, cell){
		//需要在ModelView.MetricWindow中加入内容
		this.getMetricWindow().show();
	},

    parseModelData: function(graph, modelData) {
        var parent = graph.getDefaultParent();
        for(var i = 0; i < modelData.length; i++) {
            var osObject = Ext.create('PaaSMonitor.model.Resource', modelData[i]);
            var os = graph.insertVertex(parent, osObject.ip, osObject.data, 0, 0, 48, 48, 'Vim');
//            this.expandChildren(graph, os, null, 'Vim');
        }
    },

    createMoniteeStyleObject: function(image) {
        style = new Object();
        style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_IMAGE;
        style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter;
        style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_CENTER;
        style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_TOP;
        style[mxConstants.STYLE_VERTICAL_LABEL_POSITION] = mxConstants.ALIGN_BOTTOM;
        // style[mxConstants.STYLE_STROKECOLOR] = '#1B78C8';
        style[mxConstants.STYLE_IMAGE] = image;
        style[mxConstants.STYLE_IMAGE_WIDTH] = '48';
        style[mxConstants.STYLE_IMAGE_HEIGHT] = '48';

        style[mxConstants.STYLE_FONTCOLOR] = '#000000';
        style[mxConstants.STYLE_STROKEWIDTH] = '0';
        style[mxConstants.STYLE_STARTSIZE] = '20';
        style[mxConstants.STYLE_FONTSIZE] = '12';
        style[mxConstants.STYLE_FONTSTYLE] = 1;
        return style;
    },

    configureStylesheet: function(graph) {
        var createMoniteeStyleObject = this.createMoniteeStyleObject;
        var image_path = 'resources/icons/monitees/';
        var phymImage = image_path + 'phym.png';
        graph.getStylesheet().putCellStyle('Phym', createMoniteeStyleObject(phymImage));
        vimStyle = createMoniteeStyleObject( image_path + 'vim.png');
        graph.getStylesheet().putCellStyle('Vim', vimStyle);
        serviceStyle = createMoniteeStyleObject( image_path + 'service.png');
        graph.getStylesheet().putCellStyle('Service', serviceStyle);
        tomcatStyle = createMoniteeStyleObject( image_path + 'tomcat.png');
        graph.getStylesheet().putCellStyle('tomcat', tomcatStyle);
        apacheStyle = createMoniteeStyleObject( image_path + 'appServer.png');
        graph.getStylesheet().putCellStyle('AppServer', apacheStyle);
        appStyle = createMoniteeStyleObject( image_path + 'app.png');
        graph.getStylesheet().putCellStyle('App', appStyle);
        appInstanceStyle = createMoniteeStyleObject( image_path + 'appInstance.png');
        graph.getStylesheet().putCellStyle('AppInstance', appInstanceStyle);
        paasUserStyle = createMoniteeStyleObject( image_path + 'paasUser.png');
        graph.getStylesheet().putCellStyle('PaasUser', paasUserStyle);
        style = graph.stylesheet.getDefaultEdgeStyle();
        style[mxConstants.STYLE_LABEL_BACKGROUNDCOLOR] = '#FFFFFF';
        style[mxConstants.STYLE_STROKEWIDTH] = '2';
        style[mxConstants.STYLE_ROUNDED] = true;
        style[mxConstants.STYLE_ENDARROW] = mxConstants.NONE;
    },

    foldChildren: function(graph, cell) {
        var children = this.getChildren(cell);
        if(children.length != 0) {
            for(var i = 0; i < children.length; i++) {
                this.foldChildren(graph, children[i]);
                graph.getModel().beginUpdate();
                try {
                    graph.model.remove(children[i].edges[0]);
                    graph.model.remove(children[i]);
                } finally {// Updates the display
                    graph.getModel().endUpdate();
                }
            }
        } else
        return;
    },

    expandChildren: function(graph, cell, leaf) {
        //展开以cell为parent的子节点
        //leaf属性表示展开后叶子节点的类型，如果没有leaf参数，默认只展开一层
        var controller = this;
        var type = cell.value.typeId;
        var resourceId = cell.value.id;          
        Ext.Ajax.request({
            url: 'model/getchildren',   
            method: 'get',
            timeout: 90000,
            params: {
            	id : resourceId
            },
            success: function(response){
                var json = response.responseText;
                var children = Ext.decode(json); 
                if(children.length != 0){
                    //add children vertex here
                    graph.getModel().beginUpdate();
		            try {
		                for(var i = 0; i < children.length; i++) {
		                	//操作系统的服务和服务组件不在此显示
		                	if(children[i].typeId != 3 && children[i].typeId != 4){
		                		var childObject = Ext.create('PaaSMonitor.model.Resource' , children[i]);
			                    var child = graph.insertVertex(cell, childObject.get('name'), childObject.data, 0, 0, 48, 48, controller.getTypeString(childObject.get('typeId')));
		                    	var root = graph.getDefaultParent();
			                    var parent_to_child = graph.insertEdge(root, null, '', cell, child);	
		                	}		                    	                    
		                }
		            } finally {
		                graph.getModel().endUpdate();
		            }
                }else{
                    //没有子节点
                }                
            },
            failure: function(response){
                Ext.MessageBox.alert('错误','无法加载子节点');
            }
        });
    },

    initDefEditor: function(container, outline, toolbar, sidebar, status) {
        // Specifies shadow opacity, color and offset
        mxConstants.SHADOW_OPACITY = 0.5;
        mxConstants.SHADOWCOLOR = '#C0C0C0';
        mxConstants.SHADOW_OFFSET_X = 5;
        mxConstants.SHADOW_OFFSET_Y = 6;

        mxConstants.SVG_SHADOWTRANSFORM = 'translate(' + mxConstants.SHADOW_OFFSET_X + ' ' + mxConstants.SHADOW_OFFSET_Y + ')';

        // Table icon dimensions and position
        mxSwimlane.prototype.imageSize = 20;
        mxSwimlane.prototype.imageDx = 16;
        mxSwimlane.prototype.imageDy = 4;

        // Implements white content area for swimlane in SVG
        mxSwimlaneCreateSvg = mxSwimlane.prototype.createSvg;
        mxSwimlane.prototype.createSvg = function() {
            var node = mxSwimlaneCreateSvg.apply(this, arguments);

            this.content.setAttribute('fill', '#FFFFFF');

            return node;
        };
        // Implements full-height shadow for SVG
        mxSwimlaneReconfigure = mxSwimlane.prototype.reconfigure;
        mxSwimlane.prototype.reconfigure = function(node) {
            mxSwimlaneReconfigure.apply(this, arguments);

            if(this.dialect == mxConstants.DIALECT_SVG && this.shadowNode != null) {
                this.shadowNode.setAttribute('height', this.bounds.height);
            }
        };
        // Implements table icon position and full-height shadow for SVG repaints
        mxSwimlaneRedrawSvg = mxSwimlane.prototype.redrawSvg;
        mxSwimlane.prototype.redrawSvg = function() {
            mxSwimlaneRedrawSvg.apply(this, arguments);

            // Full-height shadow
            if(this.dialect == mxConstants.DIALECT_SVG && this.shadowNode != null) {
                this.shadowNode.setAttribute('height', this.bounds.height);
            }

            // Positions table icon
            if(this.imageNode != null) {
                this.imageNode.setAttribute('x', this.bounds.x + this.imageDx * this.scale);
                this.imageNode.setAttribute('y', this.bounds.y + this.imageDy * this.scale);
            }
        };
        // Implements table icon position for swimlane in VML
        mxSwimlaneRedrawVml = mxSwimlane.prototype.redrawVml;
        mxSwimlane.prototype.redrawVml = function() {
            mxSwimlaneRedrawVml.apply(this, arguments);

            // Positions table icon
            if(this.imageNode != null) {
                this.imageNode.style.left = Math.floor(this.imageDx * this.scale) + 'px';
                this.imageNode.style.top = Math.floor(this.imageDy * this.scale) + 'px';
            }
        };
        // Replaces the built-in shadow with a custom shadow and adds
        // white content area for swimlane in VML
        mxSwimlaneCreateVml = mxSwimlane.prototype.createVml;
        mxSwimlane.prototype.createVml = function() {
            this.isShadow = false;
            var node = mxSwimlaneCreateVml.apply(this, arguments);
            this.shadowNode = document.createElement('v:rect');

            // Position and size of shadow are static
            this.shadowNode.style.left = mxConstants.SHADOW_OFFSET_X + 'px';
            this.shadowNode.style.top = mxConstants.SHADOW_OFFSET_Y + 'px';
            this.shadowNode.style.width = '100%'
            this.shadowNode.style.height = '100%'

            // Color for shadow fill
            var fillNode = document.createElement('v:fill');
            this.updateVmlFill(fillNode, mxConstants.SHADOWCOLOR, null, null, mxConstants.SHADOW_OPACITY * 100);
            this.shadowNode.appendChild(fillNode);

            // Color and weight of shadow stroke
            this.shadowNode.setAttribute('strokecolor', mxConstants.SHADOWCOLOR);
            this.shadowNode.setAttribute('strokeweight', (this.strokewidth * this.scale) + 'px');

            // Opacity of stroke
            var strokeNode = document.createElement('v:stroke');
            strokeNode.setAttribute('opacity', (mxConstants.SHADOW_OPACITY * 100) + '%');
            this.shadowNode.appendChild(strokeNode);

            node.insertBefore(this.shadowNode, node.firstChild);

            // White content area of swimlane
            this.content.setAttribute('fillcolor', 'white');
            this.content.setAttribute('filled', 'true');

            // Sets opacity on content area fill
            if(this.opacity != null) {
                var contentFillNode = document.createElement('v:fill');
                contentFillNode.setAttribute('opacity', this.opacity + '%');
                this.content.appendChild(contentFillNode);
            }

            return node;
        };
        // Defines an icon for creating new connections in the connection handler.
        // This will automatically disable the highlighting of the source vertex.
        mxConnectionHandler.prototype.connectImage = new mxImage('images/connector.gif', 16, 16);

        // Prefetches all images that appear in colums
        // to avoid problems with the auto-layout
        var keyImage = new Image();
        keyImage.src = "images/key.png";

        var plusImage = new Image();
        plusImage.src = "images/plus.png";

        var checkImage = new Image();
        checkImage.src = "images/check.png";

        // Workaround for Internet Explorer ignoring certain CSS directives
        if(mxClient.IS_IE) {
            new mxDivResizer(container);
            new mxDivResizer(outline);
            new mxDivResizer(toolbar);
            new mxDivResizer(sidebar);
            new mxDivResizer(status);
        }

        // Creates the graph inside the given container. The
        // editor is used to create certain functionality for the
        // graph, such as the rubberband selection, but most parts
        // of the UI are custom in this example.
        var editor = new mxEditor();
        var graph = editor.graph;
        var model = graph.model;

        // Disables some global features
        graph.setConnectable(true);
        graph.setCellsDisconnectable(false);
        graph.setCellsCloneable(false);
        graph.swimlaneNesting = false;
        graph.dropEnabled = true;

        // Does not allow dangling edges
        graph.setAllowDanglingEdges(false);

        // Forces use of default edge in mxConnectionHandler
        graph.connectionHandler.factoryMethod = null;

        // Only tables are resizable
        graph.isCellResizable = function(cell) {
            return this.isSwimlane(cell);
        };
        // Only tables are movable
        graph.isCellMovable = function(cell) {
            return this.isSwimlane(cell);
        };
        // Sets the graph container and configures the editor
        editor.setGraphContainer(container);
        var config = mxUtils.load('config/keyhandler-minimal.xml').getDocumentElement();
        editor.configure(config);

        // Configures the automatic layout for the table columns
        editor.layoutSwimlanes = true;
        editor.createSwimlaneLayout = function() {
            var layout = new mxStackLayout(this.graph, false);
            layout.fill = true;
            layout.resizeParent = true;

            // Overrides the function to always return true
            layout.isVertexMovable = function(cell) {
                return true;
            };
            return layout;
        };
        // Text label changes will go into the name field of the user object
        /*
        graph.model.valueForCellChanged = function(cell, value) {
        if(value.name != null) {
        return mxGraphModel.prototype.valueForCellChanged.apply(this, arguments);
        } else {
        var old = cell.value.name;
        cell.value.name = value;
        return old;
        }
        };
        */
        // Columns are dynamically created HTML labels
        graph.isHtmlLabel = function(cell) {
            return !this.isSwimlane(cell) && !this.model.isEdge(cell);
        };
        // Edges are not editable
        /*
        graph.isCellEditable = function(cell) {
        return !this.model.isEdge(cell);
        };
        */
        // Returns the name field of the user object for the label
        graph.convertValueToString = function(cell) {
            if(cell.value != null && cell.value.name != null) {
                return cell.value.name;
            }

            return mxGraph.prototype.convertValueToString.apply(this, arguments);
            // "supercall"
        };
        // Returns the type as the tooltip for column cells
        graph.getTooltip = function(state) {
            if(this.isHtmlLabel(state.cell)) {
                return 'Type: ' + state.cell.value.type;
            } else if(this.model.isEdge(state.cell)) {				
                // var source = this.model.getTerminal(state.cell, true);
                // var parent = this.model.getParent(source);
                // return parent.value.name + '.' + source.value.name;

                //When hovering on a connection line
                return state.cell.value;
            }

            return mxGraph.prototype.getTooltip.apply(this, arguments);
            // "supercall"
        };
        // Creates a dynamic HTML label for column fields
        graph.getLabel = function(cell) {
            if(this.isHtmlLabel(cell)) {
                var label = '';
                if(cell.value.category == 'Config') {
                    label += '<img title="Config" src="images/icons48/settings.png" width="16" height="16" align="top">&nbsp;';
                }
                if(cell.value.category == 'Monitor') {
                    label += '<img title="View" src="images/icons48/view.png" width="16" height="16" align="top">&nbsp;';
                }
                if(cell.value.category == 'Control') {
                    label += '<img title="View" src="images/icons48/edit.png" width="16" height="16" align="top">&nbsp;';
                }

                var mapped = '';
                if(cell.value.mapped)
                mapped = '&nbsp;&nbsp;<img title="Mapped" src="images/check.png" width="16" height="16" align="top">'
                return label + mxUtils.htmlEntities(cell.value.name, false) + '&nbsp;<span style="color:#B0B0B0; font-style: italic">' + mxUtils.htmlEntities(cell.value.type, false) + '</span>' + mapped;
            }

            return mxGraph.prototype.getLabel.apply(this, arguments);
            // "supercall"
        };
        // Removes the source vertex if edges are removed
        /*
        graph.addListener(mxEvent.REMOVE_CELLS, function(sender, evt) {
        var cells = evt.getProperty('cells');

        for(var i = 0; i < cells.length; i++) {
        var cell = cells[i];

        if(this.model.isEdge(cell)) {
        var terminal = this.model.getTerminal(cell, true);
        var parent = this.model.getParent(terminal);
        this.model.remove(terminal);
        }
        }
        });
        */
        // Disables drag-and-drop into non-swimlanes.
        graph.isValidDropTarget = function(cell, cells, evt) {
            return this.isSwimlane(cell);
        };
        // Installs a popupmenu handler using local function (see below).
        graph.panningHandler.factoryMethod = function(menu, cell, evt) {
            createPopupMenu(editor, graph, menu, cell, evt);
        };
        // Adds all required styles to the graph (see below)
        configureStylesheet(graph);

        // Adds sidebar icon for each object
        var attributeObject = new Attribute('ATTRIBUTENAME');
        var attribute = new mxCell(attributeObject, new mxGeometry(0, 0, 0, 26));
        attribute.setVertex(true);
        attribute.setConnectable(false);

        var phymObject = new Phym('Phym');
        var phym = new mxCell(phymObject, new mxGeometry(0, 0, 200, 54), 'phym');
        phym.setVertex(true);
        this.addSidebarIcon(graph, sidebar, phym, 'images/icons48/phym.png');

        // addConfigs(phymObject, phym, attribute);

        var vimObject = new Vim('Vim');
        var vim = new mxCell(vimObject, new mxGeometry(0, 0, 200, 54), 'vim');
        vim.setVertex(true);
        this.addSidebarIcon(graph, sidebar, vim, 'images/icons48/bigvim.png');
        // addConfigs(vimObject, vim, attribute);

        var serviceObject = new Service('Platform Service');
        var service = new mxCell(serviceObject, new mxGeometry(0, 0, 200, 54), 'service');
        service.setVertex(true);
        this.addSidebarIcon(graph, sidebar, service, 'images/icons48/service.png');
        // addConfigs(serviceObject, service, attribute);

        var appServerObject = new AppServer('Application Server');
        var appServer = new mxCell(appServerObject, new mxGeometry(0, 0, 200, 54), 'appServer');
        appServer.setVertex(true);
        this.addSidebarIcon(graph, sidebar, appServer, 'images/icons48/appserver.png');
        // addConfigs(appServerObject, appServer, attribute);

        var appObject = new App('Application');
        var app = new mxCell(appObject, new mxGeometry(0, 0, 200, 54), 'app');
        app.setVertex(true);
        this.addSidebarIcon(graph, sidebar, app, 'images/icons48/app.png');
        // addConfigs(appObject, app, attribute);

        var appInstanceObject = new AppInstance('Application Instance');
        var appInstance = new mxCell(appInstanceObject, new mxGeometry(0, 0, 200, 54), 'appInstance');
        appInstance.setVertex(true);
        this.addSidebarIcon(graph, sidebar, appInstance, 'images/icons48/appInstance.png');
        // addConfigs(appInstanceObject, appInstance, attribute);

        var paasUserObject = new PaasUser('PaaS User');
        var paasUser = new mxCell(paasUserObject, new mxGeometry(0, 0, 200, 54), 'paasUser');
        paasUser.setVertex(true);
        this.addSidebarIcon(graph, sidebar, paasUser, 'images/icons48/paasUser.png');

        // Creates a new DIV that is used as a toolbar and adds
        // toolbar buttons.
        var spacer = document.createElement('div');
        spacer.style.display = 'inline';
        spacer.style.padding = '8px';

        this.addToolbarButton(editor, toolbar, 'properties', 'Properties', 'images/properties.gif');

        // Defines a new export action
        editor.addAction('properties', function(editor, cell) {
            if(cell == null) {
                cell = graph.getSelectionCell();
            }

            if(graph.isHtmlLabel(cell)) {
                showProperties(graph, cell);
            }
        });

        editor.addAction('add', function(editor, cell) {			
            addAttribute(graph, cell, attribute);			
        });

        editor.addAction('mapping', function(editor, cell) {
            /*
            if (cell == null)
            {
            cell = graph.getSelectionCell();
            }
            */
            // if (graph.isHtmlLabel(cell))
            // {
            mapping(graph, cell);
            // }
        });
        this.addToolbarButton(editor, toolbar, 'delete', 'Delete', 'images/delete2.png');

        toolbar.appendChild(spacer.cloneNode(true));

        this.addToolbarButton(editor, toolbar, 'undo', '', 'images/undo.png');
        this.addToolbarButton(editor, toolbar, 'redo', '', 'images/redo.png');

        toolbar.appendChild(spacer.cloneNode(true));

        // addToolbarButton(editor, toolbar, 'show', 'Show', 'images/camera.png');
        // addToolbarButton(editor, toolbar, 'print', 'Print', 'images/printer.png');

        // toolbar.appendChild(spacer.cloneNode(true));

        // Defines export XML action
        editor.addAction('export', function(editor, cell) {
            var textarea = document.createElement('textarea');
            textarea.style.width = '400px';
            textarea.style.height = '400px';
            var enc = new mxCodec(mxUtils.createXmlDocument());
            var node = enc.encode(editor.graph.getModel());
            textarea.value = mxUtils.getPrettyXml(node);
            showModalWindow('XML', textarea, 410, 440);
        });
        this.addToolbarButton(editor, toolbar, 'export', 'Export XML', 'images/export1.png');

        editor.addAction('save', function(editor, cell) {
            saveModel(editor);
        });
        this.addToolbarButton(editor, toolbar, 'save', 'Save Model', 'images/export1.png');

        // Adds toolbar buttons into the status bar at the bottom
        // of the window.
        this.addToolbarButton(editor, status, 'collapseAll', 'Collapse All', 'images/navigate_minus.png', true);
        this.addToolbarButton(editor, status, 'expandAll', 'Expand All', 'images/navigate_plus.png', true);

        status.appendChild(spacer.cloneNode(true));

        this.addToolbarButton(editor, status, 'zoomIn', '', 'images/zoom_in.png', true);
        this.addToolbarButton(editor, status, 'zoomOut', '', 'images/zoom_out.png', true);
        this.addToolbarButton(editor, status, 'actualSize', '', 'images/view_1_1.png', true);
        this.addToolbarButton(editor, status, 'fit', '', 'images/fit_to_size.png', true);

        // Creates the outline (navigator, overview) for moving
        // around the graph in the top, right corner of the window.
        var outln = new mxOutline(graph, outline);

        // Fades-out the splash screen after the UI has been loaded.
        var splash = document.getElementById('splash');
        if(splash != null) {
            try {
                mxEvent.release(splash);
                mxEffects.fadeOut(splash, 100, true);
            } catch (e) {

                // mxUtils is not available (library not loaded)
                splash.parentNode.removeChild(splash);
            }
        }
        return editor;


    },

    addSidebarIcon: function(graph, sidebar, prototype, image) {
        // Function that is executed when the image is dropped on
        // the graph. The cell argument points to the cell under
        // the mousepointer if there is one.
        var funct = function(graph, evt, cell) {
            graph.stopEditing(false);

            var pt = graph.getPointForEvent(evt);

            var parent = graph.getDefaultParent();
            var model = graph.getModel();

            var isTable = graph.isSwimlane(prototype);
            var name = null;
            /*

            if (!isTable)
            {
            var offset = mxUtils.getOffset(graph.container);

            parent = graph.getSwimlaneAt(evt.clientX-offset.x, evt.clientY-offset.y);
            var pstate = graph.getView().getState(parent);

            if (parent == null ||
            pstate == null)
            {
            mxUtils.alert('Drop target must be a table');
            return;
            }

            pt.x -= pstate.x;
            pt.y -= pstate.y;

            var columnCount = graph.model.getChildCount(parent)+1;
            name = mxUtils.prompt('Enter name for new column', 'COLUMN'+columnCount);
            }
            else*/
            {
                /*
                var tableCount = 0;
                var childCount = graph.model.getChildCount(parent);

                for (var i=0; i<childCount; i++)
                {
                if (!graph.model.isEdge(graph.model.getChildAt(parent, i)))
                {
                tableCount++;
                }
                }
                */

                graph.model.getChildCount(parent) + 1;
            }

            var v1 = model.cloneCell(prototype);
            model.beginUpdate();
            try {
                // v1.value.name = name;
                value = v1.value;
                v1.geometry.x = pt.x;
                v1.geometry.y = pt.y;

                graph.addCell(v1, parent);

                // if (isTable)
                // {
                v1.geometry.alternateBounds = new mxRectangle(0, 0, v1.geometry.width, v1.geometry.height);
                // v1.children[0].value.value = ip;
                // v1.children[1].value.value = jmxPort;

                // }
            } finally {
                model.endUpdate();
            }

            graph.setSelectionCell(v1);

        }
        // Creates the image which is used as the sidebar icon (drag source)
        var img = document.createElement('img');
        img.setAttribute('src', image);
        img.style.width = '48px';
        img.style.height = '48px';
        img.style.margin = '5px';
        img.title = prototype.value.name;
        sidebar.appendChild(img);

        // Creates the image which is used as the drag icon (preview)
        var dragImage = img.cloneNode(true);
        var ds = mxUtils.makeDraggable(img, graph, funct, dragImage);

        // Adds highlight of target tables for columns
        ds.highlightDropTargets = true;
        ds.getDropTarget = function(graph, x, y) {
            if(graph.isSwimlane(prototype)) {
                return null;
            } else {
                var cell = graph.getCellAt(x, y);

                if(graph.isSwimlane(cell)) {
                    return cell;
                } else {
                    var parent = graph.getModel().getParent(cell);

                    if(graph.isSwimlane(parent)) {
                        return parent;
                    }
                }
            }
        };
    },

    addToolbarButton: function(editor, toolbar, action, label, image, isTransparent) {
        var button = document.createElement('button');
        button.style.fontSize = '10';
        if(image != null) {
            var img = document.createElement('img');
            img.setAttribute('src', image);
            img.style.width = '16px';
            img.style.height = '16px';
            img.style.verticalAlign = 'middle';
            img.style.marginRight = '2px';
            button.appendChild(img);
        }
        if(isTransparent) {
            button.style.background = 'transparent';
            button.style.color = '#FFFFFF';
            button.style.border = 'none';
        }
        mxEvent.addListener(button, 'click', function(evt) {
            editor.execute(action);
        });
        mxUtils.write(button, label);
        toolbar.appendChild(button);
    },

    getChildType: function(parent) {
        if(parent == 'Phym')
        return 'Vim';
        if(parent == 'Vim')
        return 'AppServer';
        if(parent == 'AppServer')
        return 'AppInstance';
    },
    
    
    getTypeString: function(id){
    	switch(id){
    		case 1:
    			return 'Phym';
    		case 2:
    			return 'Vim';
    		case 5:
    			return 'AppServer';
    		case 7:
    			return 'AppInstance';
    		default:
    			return 'NotFound';
    	}
    },

    getChildren: function(parent) {
        var id = parent.value.id;
        var edges = parent.edges;       
        var children = new Array();
        if(edges == null)
         	return children;
        for(var j = 0; j < edges.length; j++) {
            if(edges[j].source.value.id == id) {
                children.push(edges[j].target);
            }
        }
        return children;
    }

});
