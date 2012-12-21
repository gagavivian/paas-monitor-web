Ext.define('PaaSMonitor.controller.ModelViewController', {
	extend : 'Ext.app.Controller',

	views : ['ModelView.ModelViewPanel', 'ModelView.MetricWindow', 'ModelView.HistoryDataWindow'],

	refs : [{
		ref : 'viewPanel',
		selector : 'modelviewpanel'
	}, {
		ref : 'metricWindow',
		selector : 'showmetric',
		//此处一定要加xtype，否则无法创建出正确的component类型
		xtype : 'showmetric',
		autoCreate : true
	}, {
		ref : 'historyDataWindow',
		selector : 'showhistorydata',
		xtype : 'showhistorydata',
		autoCreate : true
	}],

	appDictory : new Array(),
	appReg : /^Apache Tomcat\/([\d\.]+)\s(.*)\s(.*)\s(.*)\s(.*)\s\/\/(.*)\/(\w*)\s(.*)$/,
	threadReg : /^Apache Tomcat\/([\d\.]+)\s(.*)\s(.*)\sThread Pools$/,
	processorReg : /^Apache Tomcat\/([\d\.]+)\s(.*)\s(.*)\sGlobal Request Processor$/,

	init : function(application) {

		this.control({
			'modelviewpanel' : {
				activate : this.loadRuntimeModel
			},
			'#showdata' : {
				click : this.showHistoryData
			}
		});

		if (!mxClient.isBrowserSupported()) {
			// Displays an error message if the browser is
			// not supported.
			mxUtils.error('Browser is not supported!', 200, false);
		} else {
			// Creates the graph editor inside the given container
			this.viewEditor = this.initViewEditor(document.getElementById('runtimemodel_graph_container'));
		}
	},

	initViewEditor : function(container) {
		// Creates the graph inside the given container
		var controller = this;
		var editor = new mxEditor();
		var graph = editor.graph;

		editor.setGraphContainer(container);

		if (mxClient.IS_IE) {
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
			if (cell.value != null && cell.value.name != null) {
				return cell.value.name;
			}
			if (cell.value != null && cell.value.ip != null) {
				return cell.value.ip;
			}
			if (cell.value != null && cell.value.resourcePrototype != null) {
				return cell.value.resourcePrototype.name;
			}
			return mxGraph.prototype.convertValueToString.apply(this, arguments);
			// "supercall"
		};

		graph.isHtmlLabel = function(cell) {
			return !this.isSwimlane(cell) && !this.model.isEdge(cell);
		};

		graph.getLabel = function(cell) {
			if (this.isHtmlLabel(cell)) {
				/*
				if (cell.value != null && cell.value.httpPort != null) {
					var label = '';
					label += '<div>' + mxUtils.htmlEntities(cell.value.httpPort, false) + '</div>' + '<span style="color:red; font-style: italic">' + mxUtils.htmlEntities(cell.value.status, false) + '</span>';
					return label;
				}
				if (cell.value != null && cell.value.ip != null) {
					return cell.value.ip;
				}
				*/
				if (cell.value != null && cell.value.name != null) {
					return cell.value.name;
				}
				if (cell.value != null && cell.value.resourcePrototype != null) {
					return cell.value.resourcePrototype.name;
				}
			}

			return mxGraph.prototype.getLabel.apply(this, arguments);
			// "supercall"
		};

		graph.getTooltip = function(state) {
			var result = '';
			var properties = state.cell.value.resourcePropertyValues;
			if (properties != null) {
				for (var i = 0; i < properties.length; i++) {
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



		// Enables automatic layout on the graph and installs
		// a tree layout for all groups who's children are
		// being changed, added or removed.
		var layout = new mxCompactTreeLayout(graph, mxConstants.DIRECTION_WEST);
		layout.useBoundingBox = false;
		layout.edgeRouting = false;
		layout.levelDistance = 30;
		layout.nodeDistance = 30;	
		

		// Defines the condition for showing the folding icon
		graph.isCellFoldable = function(cell) {
		//	return this.model.getOutgoingEdges(cell).length > 0;
			return cell.value.childrenCount > 0;

		};

		// Defines the position of the folding icon
		graph.cellRenderer.getControlBounds = function(state) {
			if (state.control != null) {
				var oldScale = state.control.scale;
				var w = state.control.bounds.width / oldScale;
				var h = state.control.bounds.height / oldScale;
				var s = state.view.scale;

				return new mxRectangle(state.x + state.width / 2 + w / 2 * s, state.y + state.height + TreeNodeShape.prototype.segment * s + h / 2 * s, w * s, h * s);
			}

			return null;
		};

		graph.foldCells = function(collapse, recurse, cells) {			
			//如果孩子节点已经插入到graph中了		
			if(this.model.getOutgoingEdges(cells[0]).length > 0){
				this.model.beginUpdate();
				try {
					controller.foldChildren(this, cells[0], !collapse);
					this.model.setCollapsed(cells[0], collapse);	
				} finally {
					this.model.endUpdate();
				}
			}else{
				var resourceId = cells[0].value.id;
				var rptId = cells[0].value.resourcePrototype.id;
			 	Ext.Ajax.request({
					url : 'model/getchildren',
					method : 'get',
					timeout : 90000,
					params : {
					 	id : resourceId,
					 	resourcePrototypeId : rptId,
					 	parentId : cells[0].value.parentId
					},
					success : function(response) {					
						var json = response.responseText;						
						var children = controller.parseChildrenData(cells[0].value.id, cells[0].value.resourcePrototype.id, Ext.decode(json));
						cells[0].value.children = children;
						cells[0].value.childrenCount = children.length;	
						controller.addChildrenVertex(graph,cells[0]);							
					}
				});
				
			}			
		};

		// Installs a popupmenu handler using local function (see below).
		graph.panningHandler.factoryMethod = function(menu, cell, evt) {
			controller.createMoniteeMenu(editor, graph, menu, cell, evt);
		};

		return editor;
	},
	
	
	parseChildrenData : function(parentId, parentType, originalChildren){		
		var controller = this;
		//如果是tomcat 6或7的孩子的数据
		if(parentType == 12 || parentType == 13){
			var children = new Array();
			var appChild = controller.generateObject('Apps', -1);
			appChild.resourcePrototype.id = parentType + 6;
			appChild.parentId = parentId;
			var threadChild = controller.generateObject('Thread Pools', -1);
			threadChild.resourcePrototype.id = parentType + 2;
			threadChild.parentId = parentId;
			var processorChild = controller.generateObject('Global Request Processors', -1);	
			processorChild.resourcePrototype.id= parentType + 4;
			processorChild.parentId = parentId;
			for( var i in originalChildren){
				if(originalChildren[i].resourcePrototype.id == parentType +2){
					threadChild.children.push(originalChildren[i]);
				}else if(originalChildren[i].resourcePrototype.id == parentType +4){
					processorChild.children.push(originalChildren[i]);
				}else{
					appChild.children.push(originalChildren[i]);
				}
			}
			appChild.childrenCount = appChild.children.length;
			children.push(appChild);
			threadChild.childrenCount = threadChild.children.length;
			children.push(threadChild);
			processorChild.childrenCount = processorChild.children.length;
			children.push(processorChild);
			return children;
		}else{
			return originalChildren;
		}		
	},

	loadRuntimeModel : function() {
		var generateModel = this.generateModel;
		var controller = this;
		var loadMask = new Ext.LoadMask(this.getViewPanel(), {
			msg : "Loading"
		});
		loadMask.show();
		Ext.Ajax.request({
			url : 'model/getmodel?groupId=' + Ext.groupId,
			timeout : 90000,
			success : function(response) {
				var json = response.responseText;
				var phyms = Ext.decode(json);
				if (phyms.length != 0) {
					generateModel(phyms, controller);
				} else {
					Ext.MessageBox.alert('提示', '当前没有待监测对象！');
				}

				loadMask.hide();
			},
			failure : function(response) {
				loadMask.hide();
				Ext.MessageBox.alert('错误', '无法加载当前的运行时模型');
			}
		});
	},

	generateModel : function(modelData, controller) {
		// Get the created graph from the controller
		var editor = controller.viewEditor;
		var graph = editor.graph;
		var model = graph.model;

		graph.removeCells(graph.getChildVertices(graph.getDefaultParent()));
		var parent = graph.getDefaultParent();

		// Load cells and layouts the graph
		graph.getModel().beginUpdate();
		try {
			controller.parseModelData(graph, modelData);
		} finally {
			graph.getModel().endUpdate();
		}
		
		var children = parent.children;
		for(var i in parent.children){
			controller.addChildrenVertex(graph, children[i]);
		}
		
	},

	createMoniteeMenu : function(editor, graph, menu, cell, evt) {
		var controller = this;
		if (cell != null) {
			if (graph.isHtmlLabel(cell)) {
				if (cell.value.id >= 0) {
					menu.addItem('Show Monitoring Statistics', 'images/properties.gif', function() {
						//editor.execute('metric', cell);
						controller.showMetrics(graph, cell);
					});
				}

				menu.addItem('Adjust Layout', 'images/properties.gif', function() {
					//editor.execute('metric', cell);
					controller.adjustLayout(graph, cell);
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

	showMetrics : function(graph, cell) {

		//需要在ModelView.MetricWindow中加入内容

		// var url = '/metrics/' + cell.value.getAttributes('id') + '/all';
		this.metric_being_updated = cell.value.id;
		var _url = 'metrics/customed';

		var _metricWindow = this.getMetricWindow();
		var _grid = _metricWindow.items.first();

		//var _actionColumn = _grid.getComponent('actionColumn');

		var _pagingtoolbar = _grid.down('pagingtoolbar');

		var _store = _grid.getStore();

		var _proxy = _store.getProxy();
		_proxy.setExtraParam('resourceId', cell.value.id);

		_store.load({
			params : {
				start : 0,
				limit : 10,
				page : 1
			}
		});
		// _pagingtoolbar.moveFirst();

		_metricWindow.show();
	},

	/*
	adjustLayout : function(graph, root) {
		var treeLayout = new mxCompactTreeLayout(graph);
		treeLayout.intraCellSpacing = 50;
		treeLayout.execute(root);
	},
	*/

	parseModelData : function(graph, modelData) {
		var controller = this;
		var parent = graph.getDefaultParent();
		var space = 100;
		//呈现全局视图
		if (Ext.groupId == 0) {
			for (var i = 0; i < modelData.length; i++) {				
				var phym = graph.insertVertex(parent, modelData[i].name, modelData[i], 30, space * i, 48, 48, 'Phym');
				//            this.expandChildren(graph, os, null, 'Vim');
			}
		}
		//以组管理员身份进入时，第一层次为各种应用服务器
		else {
			var tomcatParent = new Object();
			tomcatParent.name = 'Tomcat';
			tomcatParent.children = new Array();
			tomcatParent.typeId = -1;

			var apacheParent = new Object();
			apacheParent.name = 'Apache';
			apacheParent.children = new Array();
			apacheParent.typeId = -1;

			for (var i = 0; i < modelData.length; i++) {
				var serverObject = modelData[i];
				var proId = serverObject.resourcePrototype.id;
				if (proId == 11) {
					apacheParent.children.push(serverObject);
				} else {
					tomcatParent.children.push(serverObject);
				}
			}
			if (apacheParent.children.length != 0) {
				apacheParent.childrenCount = apacheParent.children.length;
				var apacheFolder = graph.insertVertex(parent, 'Apache', apacheParent, 0, 0, 48, 48, 'ServerFolder');				
			}
			if (tomcatParent.children.length != 0) {
				tomcatParent.childrenCount = tomcatParent.children.length;
				var tomcatFolder = graph.insertVertex(parent, 'Tomcat', tomcatParent, 0, 0, 48, 48, 'ServerFolder');
			}		
		}
	},

	createMoniteeStyleObject : function(image) {
		style = new Object();

		style[mxConstants.STYLE_SHAPE] = 'treenode';
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

	configureStylesheet : function(graph) {
		var createMoniteeStyleObject = this.createMoniteeStyleObject;
		var image_path = 'resources/icons/monitees/';
		var phymImage = image_path + 'phym.png';
		graph.getStylesheet().putCellStyle('Phym', createMoniteeStyleObject(phymImage));
		vimStyle = createMoniteeStyleObject(image_path + 'vim.png');
		graph.getStylesheet().putCellStyle('Vim', vimStyle);
		serviceStyle = createMoniteeStyleObject(image_path + 'service.png');
		graph.getStylesheet().putCellStyle('Service', serviceStyle);
		tomcatStyle = createMoniteeStyleObject(image_path + 'tomcat.png');
		graph.getStylesheet().putCellStyle('tomcat', tomcatStyle);
		apacheStyle = createMoniteeStyleObject(image_path + 'appServer.png');
		graph.getStylesheet().putCellStyle('AppServer', apacheStyle);
		appStyle = createMoniteeStyleObject(image_path + 'app.png');
		graph.getStylesheet().putCellStyle('App', appStyle);
		appInstanceStyle = createMoniteeStyleObject(image_path + 'appInstance.png');
		graph.getStylesheet().putCellStyle('AppInstance', appInstanceStyle);
		paasUserStyle = createMoniteeStyleObject(image_path + 'paasUser.png');
		graph.getStylesheet().putCellStyle('PaasUser', paasUserStyle);
		collectionStyle = createMoniteeStyleObject(image_path + 'collection.jpg');
		graph.getStylesheet().putCellStyle('Collection', collectionStyle);
		serverFolderStyle = createMoniteeStyleObject(image_path + 'serverfolder.png');
		graph.getStylesheet().putCellStyle('ServerFolder', serverFolderStyle);
		style = graph.stylesheet.getDefaultEdgeStyle();
		style[mxConstants.STYLE_LABEL_BACKGROUNDCOLOR] = '#FFFFFF';
		style[mxConstants.STYLE_STROKEWIDTH] = '2';
		style[mxConstants.STYLE_ROUNDED] = true;
		style[mxConstants.STYLE_ENDARROW] = mxConstants.NONE;
	},

	foldChildren : function(graph, cell, show){
		show = (show != null) ? show : true;
			var cells = [];
			
			graph.traverse(cell, true, function(vertex)
			{
				if (vertex != cell)
				{
					cells.push(vertex);
				}
				// Stops recursion if a collapsed cell is seen
				return vertex == cell || !graph.isCellCollapsed(vertex);
			});

			graph.toggleCells(show, cells, true);
	},

	addChildrenVertex : function(graph, cell) {		
		var controller = this;
		var xspace = 150;
		var space = 100;
		var geox = cell.geometry.x;
		var geoy = cell.geometry.y;
		var children = cell.value.children;
		if (children != null) {
			graph.getModel().beginUpdate();
			try {
				graph.model.setCollapsed(cell, false);				
				for (var i in children) {
					var root = graph.getDefaultParent();
					var child = graph.insertVertex(root, children[i].name, children[i], geox + xspace, geoy + space * i, 48, 48, controller.getTypeString(children[i].typeId));
					var parent_to_child = graph.insertEdge(root, null, '', cell, child);
					if(children[i].childrenCount>0){
						child.setCollapsed(true);
					}
				}				
			} finally {
				graph.getModel().endUpdate();
			}
		}
	},

	generateObject : function(name, typeId) {
		var o = new Object();
		o.name = name;
		o.typeId = typeId;
		o.children = new Array();
		o.resourcePrototype = new Object();
		return o;
	},


	getChildType : function(parent) {
		if (parent == 'Phym')
			return 'Vim';
		if (parent == 'Vim')
			return 'AppServer';
		if (parent == 'AppServer')
			return 'AppInstance';
	},

	getTypeString : function(id) {
		switch(id) {
			case 1:
				return 'Phym';
			case 2:
				return 'Vim';
			case 3:
				return 'AppServer';
			case 5:
				return 'AppServer';
			case 6:
				return 'AppInstance';
			case null:
				return 'AppInstance';
			case -1:
				return 'Collection';
			default:
				return 'NotFound';
		}
	},

	showHistoryData : function(view, cell, row, col, e) {
		//var m = e.getTarget().className.match(/\bicon-(\w+)\b/)
		//if(m){
		//选择该列
		var grid = this.getMetricWindow().down('grid');
		var metricStore = grid.getStore();
		grid.getSelectionModel().select(row, false);
		var historyDataWindow = this.getHistoryDataWindow();
		var chart = historyDataWindow.down('panel').down('chart');
		var historyDataStore = chart.getStore();
		var _proxy = historyDataStore.getProxy();
		//var groupId = 1;
		var resourceId = this.metric_being_updated;
		var metricId = metricStore.getAt(row).get('id');
		//_proxy.setExtraParam('groupId', groupId);
		_proxy.setExtraParam('resourceId', resourceId);
		_proxy.setExtraParam('metricId', metricId);

		historyDataStore.load({
			scope : this,
			callback : function(records, operation, success) {
				var max = historyDataStore.max('value');
				var min = 0;
				chart.axes.items[0].minimum = min;
				chart.axes.items[0].maximum = max;
				chart.axes.items[1].minimum = records[0].data.timestamp;
				chart.axes.items[1].maximum = records[records.length - 1].data.timestamp;
				chart.axes.items[1].step = [Ext.Date.MINUTE, 60];
				chart.refresh();
			}
		});

		historyDataWindow.show();
	}
});
