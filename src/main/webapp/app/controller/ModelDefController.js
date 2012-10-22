Ext.define('PaaSMonitor.controller.ModelDefController', {
	extend : 'Ext.app.Controller',

	views : ['ModelDef.ModelDefPanel', 'ModelDef.MetricUpdateWindow', 'ModelDef.ServerTypeSelect'],

	refs : [{
		ref : 'defPanel',
		selector : 'modeldefpanel'
	}, {
		ref : 'templateWindow',
		selector : 'templatewindow',
		//此处一定要加xtype，否则无法创建出正确的component类型
		xtype : 'templatewindow',
		autoCreate : true
	}, {
		ref : 'serverTypeSelect',
		selector : 'servertypeselect',
		xtype : 'servertypeselect',
		autoCreate : true
	}],

	init : function(application) {
		this.control({
			/*'modeldefpanel' : {
			 activate : this.loadModelDef
			 }
			 */
			'#update_metrics_button' : {
				click : this.updateMetrics
			},

			'#select_type_server' : {
				click : this.chooseAppServerType
			}
		});

		if (!mxClient.isBrowserSupported()) {
			// Displays an error message if the browser is
			// not supported.
			mxUtils.error('Browser is not supported!', 200, false);
		} else {
			this.defEditor = this.initDefEditor(document.getElementById('modeldef_graph_container'), document.getElementById('modeldef_outline_container'), document.getElementById('modeldef_toolbar_container'), document.getElementById('modeldef_sidebar_container'), document.getElementById('modeldef_status_container'));
		}
		this.metric_being_updated = null;
	},

	loadModelDef : function() {
		var graph = this.defEditor.graph;
		var loadMask = new Ext.LoadMask(this.getDefPanel(), {
			msg : "Loading"
		});
		loadMask.show();
		mxUtils.get('model.xml', function(req) {
			loadMask.hide();
			var root = req.getDocumentElement();
			var dec = new mxCodec(root);
			graph.getModel().beginUpdate();
			dec.decode(root, graph.getModel());
			graph.getModel().endUpdate();
		});
	},

	initDefEditor : function(container, outline, toolbar, sidebar, status) {
		var controller = this;
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

			if (this.dialect == mxConstants.DIALECT_SVG && this.shadowNode != null) {
				this.shadowNode.setAttribute('height', this.bounds.height);
			}
		};
		// Implements table icon position and full-height shadow for SVG repaints
		mxSwimlaneRedrawSvg = mxSwimlane.prototype.redrawSvg;
		mxSwimlane.prototype.redrawSvg = function() {
			mxSwimlaneRedrawSvg.apply(this, arguments);

			// Full-height shadow
			if (this.dialect == mxConstants.DIALECT_SVG && this.shadowNode != null) {
				this.shadowNode.setAttribute('height', this.bounds.height);
			}

			// Positions table icon
			if (this.imageNode != null) {
				this.imageNode.setAttribute('x', this.bounds.x + this.imageDx * this.scale);
				this.imageNode.setAttribute('y', this.bounds.y + this.imageDy * this.scale);
			}
		};
		// Implements table icon position for swimlane in VML
		mxSwimlaneRedrawVml = mxSwimlane.prototype.redrawVml;
		mxSwimlane.prototype.redrawVml = function() {
			mxSwimlaneRedrawVml.apply(this, arguments);

			// Positions table icon
			if (this.imageNode != null) {
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
			this.shadowNode.style.width = '100%';
			this.shadowNode.style.height = '100%';

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
			if (this.opacity != null) {
				var contentFillNode = document.createElement('v:fill');
				contentFillNode.setAttribute('opacity', this.opacity + '%');
				this.content.appendChild(contentFillNode);
			}
			return node;
		};

		// Workaround for Internet Explorer ignoring certain CSS directives
		if (mxClient.IS_IE) {
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
			if (cell.value != null && cell.value.name != null) {
				return cell.value.name;
			}

			return mxGraph.prototype.convertValueToString.apply(this, arguments);
			// "supercall"
		};
		// Returns the type as the tooltip for column cells
		graph.getTooltip = function(state) {
			if (this.isHtmlLabel(state.cell)) {
				return 'Type: ' + state.cell.value.type;
			} else if (this.model.isEdge(state.cell)) {
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
			if (this.isHtmlLabel(cell)) {
				var label = '';
				if (cell.value.category == 'Config') {
					label += '<img title="Config" src="images/icons48/settings.png" width="16" height="16" align="top">&nbsp;';
				}
				if (cell.value.category == 'Monitor') {
					label += '<img title="View" src="images/icons48/view.png" width="16" height="16" align="top">&nbsp;';
				}
				if (cell.value.category == 'Control') {
					label += '<img title="View" src="images/icons48/edit.png" width="16" height="16" align="top">&nbsp;';
				}

				var mapped = '';
				if (cell.value.mapped)
					mapped = '&nbsp;&nbsp;<img title="Mapped" src="images/check.png" width="16" height="16" align="top">';
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
			controller.createPopupMenu(editor, graph, menu, cell, evt);
		};
		// Adds all required styles to the graph (see below)
		this.configureDefStylesheet(graph);

		// Adds sidebar icon for each object
		// var attributeObject = new Attribute('ATTRIBUTENAME');
		// var attribute = new mxCell(attributeObject, new mxGeometry(0, 0, 0, 26));
		// attribute.setVertex(true);
		// attribute.setConnectable(false);

		var phymPrototype = Ext.create('PaaSMonitor.model.ResourcePrototype', {
			id : 1,
			name : 'VMware Vsphere'
		});
		var phym = new mxCell(phymPrototype.data, new mxGeometry(0, 0, 200, 54), 'phym');
		phym.setVertex(true);
		this.addSidebarIcon(graph, sidebar, phym, 'images/icons48/phym.png');

		var vimPrototype = Ext.create('PaaSMonitor.model.ResourcePrototype', {
			id : 2,
			name : 'Win32'
		});
		var vim = new mxCell(vimPrototype.data, new mxGeometry(0, 0, 200, 54), 'vim');
		vim.setVertex(true);
		this.addSidebarIcon(graph, sidebar, vim, 'images/icons48/bigvim.png');

		var platformServicePrototype = Ext.create('PaaSMonitor.model.ResourcePrototype', {
			id : 3,
			name : 'Mysql'
		});
		var platformService = new mxCell(platformServicePrototype.data, new mxGeometry(0, 0, 200, 54), 'service');
		platformService.setVertex(true);
		this.addSidebarIcon(graph, sidebar, platformService, 'images/icons48/service.png');

		var appServerPrototype = Ext.create('PaaSMonitor.model.ResourcePrototype', {
			typeId : 4,
			name : 'App Server'
		});
		var appServer = new mxCell(appServerPrototype.data, new mxGeometry(0, 0, 200, 54), 'appServer');
		appServer.setVertex(true);
		this.addSidebarIcon(graph, sidebar, appServer, 'images/icons48/appserver.png');

		var appPrototype = Ext.create('PaaSMonitor.model.ResourcePrototype', {
			id : 1,
			name : 'VMware Vsphere'
		});
		var app = new mxCell(appPrototype.data, new mxGeometry(0, 0, 200, 54), 'app');
		app.setVertex(true);
		this.addSidebarIcon(graph, sidebar, app, 'images/icons48/app.png');

		var appInstancePrototype = Ext.create('PaaSMonitor.model.ResourcePrototype', {
			id : 1,
			name : 'App Instance'
		});
		var appInstance = new mxCell(appInstancePrototype.data, new mxGeometry(0, 0, 200, 54), 'appInstance');
		appInstance.setVertex(true);
		this.addSidebarIcon(graph, sidebar, appInstance, 'images/icons48/appInstance.png');

		var paasUserPrototype = Ext.create('PaaSMonitor.model.ResourcePrototype', {
			id : 1,
			name : 'VMware Vsphere'
		});
		var paasUser = new mxCell(paasUserPrototype.data, new mxGeometry(0, 0, 200, 54), 'paasUser');
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
			if (cell == null) {
				cell = graph.getSelectionCell();
			}

			if (graph.isHtmlLabel(cell)) {
				showProperties(graph, cell);
			}
		});

		editor.addAction('add', function(editor, cell) {
			controller.showMetricList(graph, cell);
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
		if (splash != null) {
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

	//定义各个cell的style
	configureDefStylesheet : function(graph) {
		var style = new Object();
		style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RECTANGLE;
		style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter;
		style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_LEFT;
		style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_MIDDLE;
		style[mxConstants.STYLE_FONTCOLOR] = '#000000';
		style[mxConstants.STYLE_FONTSIZE] = '11';
		style[mxConstants.STYLE_FONTSTYLE] = 0;
		style[mxConstants.STYLE_SPACING_LEFT] = '4';
		style[mxConstants.STYLE_IMAGE_WIDTH] = '48';
		style[mxConstants.STYLE_IMAGE_HEIGHT] = '48';
		graph.getStylesheet().putDefaultVertexStyle(style);
		phymStyle = this.createDefStyleObject('images/icons48/phym.png');
		graph.getStylesheet().putCellStyle('phym', phymStyle);
		vimStyle = this.createDefStyleObject('images/icons48/bigvim.png');
		graph.getStylesheet().putCellStyle('vim', vimStyle);
		serviceStyle = this.createDefStyleObject('images/icons48/service.png');
		graph.getStylesheet().putCellStyle('service', serviceStyle);
		appServerStyle = this.createDefStyleObject('images/icons48/appserver.png');
		graph.getStylesheet().putCellStyle('appServer', appServerStyle);
		appStyle = this.createDefStyleObject('images/icons48/app.png');
		graph.getStylesheet().putCellStyle('app', appStyle);
		appInstanceStyle = this.createDefStyleObject('images/icons48/appInstance.png');
		graph.getStylesheet().putCellStyle('appInstance', appInstanceStyle);
		paasUserStyle = this.createDefStyleObject('images/icons48/paasUser.png');
		graph.getStylesheet().putCellStyle('paasUser', paasUserStyle);
		style = graph.stylesheet.getDefaultEdgeStyle();
		style[mxConstants.STYLE_LABEL_BACKGROUNDCOLOR] = '#FFFFFF';
		style[mxConstants.STYLE_STROKEWIDTH] = '2';
		style[mxConstants.STYLE_ROUNDED] = true;
		style[mxConstants.STYLE_ENDARROW] = mxConstants.NONE;

		// style[mxConstants.STYLE_EDGE] = mxEdgeStyle.EntityRelation;

	},

	//创建基本的styleObject
	createDefStyleObject : function(image) {
		style = new Object();
		style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_SWIMLANE;
		style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter;
		style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_CENTER;
		style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_TOP;
		style[mxConstants.STYLE_GRADIENTCOLOR] = '#41B9F5';
		style[mxConstants.STYLE_FILLCOLOR] = '#8CCDF5';
		style[mxConstants.STYLE_STROKECOLOR] = '#1B78C8';
		style[mxConstants.STYLE_FONTCOLOR] = '#000000';
		style[mxConstants.STYLE_STROKEWIDTH] = '2';
		style[mxConstants.STYLE_STARTSIZE] = '28';
		style[mxConstants.STYLE_VERTICAL_ALIGN] = 'middle';
		style[mxConstants.STYLE_FONTSIZE] = '12';
		style[mxConstants.STYLE_FONTSTYLE] = 1;
		style[mxConstants.STYLE_IMAGE] = image;
		// Looks better without opacity if shadow is enabled
		//style[mxConstants.STYLE_OPACITY] = '80';
		style[mxConstants.STYLE_SHADOW] = 1;
		return style;
	},

	addSidebarIcon : function(graph, sidebar, prototype, image) {
		// Function that is executed when the image is dropped on
		// the graph. The cell argument points to the cell under
		// the mousepointer if there is one.
		var controller = this;
		var _window = this.getServerTypeSelect();
		var funct = function(graph, evt, cell) {
			graph.stopEditing(false);

			var pt = graph.getPointForEvent(evt);

			var parent = graph.getDefaultParent();
			var model = graph.getModel();

			var isTable = graph.isSwimlane(prototype);
			var name = null;
			model.beginUpdate();
			try {
				value = prototype.value;

				if (value.typeId == 4) {
					controller.pt = pt;
					_window.show();
				} else {
					var v = model.cloneCell(prototype);
					v1 = v;
					v1.geometry.x = pt.x;
					v1.geometry.y = pt.y;
					graph.addCell(v1, parent);
					v1.geometry.alternateBounds = new mxRectangle(0, 0, v1.geometry.width, v1.geometry.height);
					graph.setSelectionCell(v1);
				}
			} finally {
				model.endUpdate();
			}

			// graph.setSelectionCell(v1);

		};
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
			if (graph.isSwimlane(prototype)) {
				return null;
			} else {
				var cell = graph.getCellAt(x, y);

				if (graph.isSwimlane(cell)) {
					return cell;
				} else {
					var parent = graph.getModel().getParent(cell);

					if (graph.isSwimlane(parent)) {
						return parent;
					}
				}
			}
		};
	},

	addToolbarButton : function(editor, toolbar, action, label, image, isTransparent) {
		var button = document.createElement('button');
		button.style.fontSize = '10';
		if (image != null) {
			var img = document.createElement('img');
			img.setAttribute('src', image);
			img.style.width = '16px';
			img.style.height = '16px';
			img.style.verticalAlign = 'middle';
			img.style.marginRight = '2px';
			button.appendChild(img);
		}
		if (isTransparent) {
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

	// Function to create the entries in the popupmenu
	createPopupMenu : function(editor, graph, menu, cell, evt) {
		if (cell != null) {
			if (graph.isHtmlLabel(cell)) {
				menu.addItem('Properties', 'images/properties.gif', function() {
					editor.execute('properties', cell);
				});
				if (cell.value.category == 'Monitor') {
					menu.addItem('Mapping', 'images/properties.gif', function() {
						editor.execute('mapping', cell);
					});
				}

				menu.addSeparator();

			} else {
				menu.addItem('Add Monitoring Metric', 'images/plus.png', function() {
					editor.execute('add', cell);
				});

				menu.addSeparator();
			}

			menu.addItem('Delete', 'images/delete2.png', function() {
				editor.execute('delete', cell);
			});

			menu.addSeparator();
		}

		menu.addItem('Undo', 'images/undo.png', function() {
			editor.execute('undo', cell);
		});

		menu.addItem('Redo', 'images/redo.png', function() {
			editor.execute('redo', cell);
		});
	},

	showMetricList : function(graph, cell) {
		//需要在ModelView.MetricWindow中加入内容

		// var url = '/metrics/' + cell.value.getAttributes('id') + '/all';
		this.metric_being_updated = cell.value.id;
		var _url = 'metrics/all';

		var _templateWindow = this.getTemplateWindow();
		var _grid = _templateWindow.items.first();

		var _pagingtoolbar = _grid.down('pagingtoolbar');

		var _store = _grid.getStore();

		var _proxy = _store.getProxy();
		_proxy.setExtraParam('groupId', Ext.groupId);
		_proxy.setExtraParam('resourcePrototypeId', cell.value.id);

		_store.load({
			params : {
				start : 0,
				limit : 10,
				page : 1
			}
		});
		_pagingtoolbar.moveFirst();

		_templateWindow.show();
	},

	updateMetrics : function(button) {
		var grid = button.up('window').down('grid');
		var gridStore = grid.getStore();
		var modified = gridStore.getModifiedRecords();
		var data = new Array;
		for (var i = 0; i < modified.length; i++) {
			data.push(modified[i].getData());
		}
		var _templates = Ext.encode(data);
		Ext.Ajax.request({
			url : 'generate_metrics',
			params : {
				groupId : Ext.groupId,
				resourcePrototypeId : this.metric_being_updated,
				metrics : _templates
			},
			success : function() {
				Ext.Msg.alert('成功', '生成Metric成功过！');
				button.up('window').hide();
			},
			failure : function(response) {
				Ext.Msg.alert('失败', response.responseText);
			}
		});
	},

	chooseAppServerType : function() {
		var controller = this;
		var _window = this.getServerTypeSelect();
		var graph = this.defEditor.graph;
		var model = this.defEditor.graph.model;
		var _radioGroup = _window.down('radiogroup');
		var parent = graph.getDefaultParent();
		
		model.beginUpdate();
		try {			
			var appServerPrototype;
			switch(_radioGroup.getChecked()[0].inputValue) {
				case '1':
					appServerPrototype = Ext.create('PaaSMonitor.model.ResourcePrototype', {
						id : 18,
						name : 'Apache Tomcat 6.0'
					});
					break;
				case '2':
					appServerPrototype = Ext.create('PaaSMonitor.model.ResourcePrototype', {
						id : 12,
						name : 'Apache Tomcat 7.0'
					});
					break;
				case '3':
					appServerPrototype = Ext.create('PaaSMonitor.model.ResourcePrototype', {
						id : 11,
						name : 'Apache httpd'
					});
					break;
			}		
			var newcell = new mxCell(appServerPrototype.data, new mxGeometry(controller.pt.x, controller.pt.y, 200, 54), 'appServer');
			newcell.setVertex(true);
			graph.addCell(newcell, parent);
			newcell.geometry.alternateBounds = new mxRectangle(0, 0, newcell.geometry.width, newcell.geometry.height);
			graph.setSelectionCell(newcell);
		} finally {
			model.endUpdate();
			_window.hide();
		}
	}
});
