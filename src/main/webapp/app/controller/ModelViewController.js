Ext.define('PaaSMonitor.controller.ModelViewController', {
	extend : 'Ext.app.Controller',

	views : ['ModelView.ModelViewPanel', 'ModelView.MetricWindow'],

	refs : [{
		ref : 'viewPanel',
		selector : 'modelviewpanel'
	}, {
		ref : 'metricWindow',
		selector : 'showmetric',
		//此处一定要加xtype，否则无法创建出正确的component类型
		xtype : 'showmetric',
		autoCreate : true
	}],

	init : function(application) {

		this.control({
			'modelviewpanel' : {
				activate : this.loadRuntimeModel
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
				if (cell.value != null && cell.value.httpPort != null) {
					var label = '';
					label += '<div>' + mxUtils.htmlEntities(cell.value.httpPort, false) + '</div>' + '<span style="color:red; font-style: italic">' + mxUtils.htmlEntities(cell.value.status, false) + '</span>';
					return label;
				}
				if (cell.value != null && cell.value.ip != null) {
					return cell.value.ip;
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

		graph.addListener(mxEvent.DOUBLE_CLICK, function(sender, evt) {
			var cell = evt.getProperty('cell');
			if (cell.isVertex()) {
				var style = cell.style;
				var children = controller.getChildren(cell);
				if (children.length === 0) {
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

	loadRuntimeModel : function() {
		var generateModel = this.generateModel;
		var controller = this;
		var loadMask = new Ext.LoadMask(this.getViewPanel(), {
			msg : "Loading"
		});
		loadMask.show();
		Ext.Ajax.request({
			url : 'model/getmodel',
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

	createMoniteeMenu : function(editor, graph, menu, cell, evt) {
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

	showMetrics : function(graph, cell) {
		//需要在ModelView.MetricWindow中加入内容
		this.getMetricWindow().show();
	},

	parseModelData : function(graph, modelData) {
		var parent = graph.getDefaultParent();
		for (var i = 0; i < modelData.length; i++) {
			var osObject = Ext.create('PaaSMonitor.model.Resource', modelData[i]);
			var os = graph.insertVertex(parent, osObject.ip, osObject.data, 0, 0, 48, 48, 'Vim');
			//            this.expandChildren(graph, os, null, 'Vim');
		}
	},

	createMoniteeStyleObject : function(image) {
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
		style = graph.stylesheet.getDefaultEdgeStyle();
		style[mxConstants.STYLE_LABEL_BACKGROUNDCOLOR] = '#FFFFFF';
		style[mxConstants.STYLE_STROKEWIDTH] = '2';
		style[mxConstants.STYLE_ROUNDED] = true;
		style[mxConstants.STYLE_ENDARROW] = mxConstants.NONE;
	},

	foldChildren : function(graph, cell) {
		var children = this.getChildren(cell);
		if (children.length != 0) {
			for (var i = 0; i < children.length; i++) {
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

	expandChildren : function(graph, cell, leaf) {
		//展开以cell为parent的子节点
		//leaf属性表示展开后叶子节点的类型，如果没有leaf参数，默认只展开一层
		var controller = this;
		var type = cell.value.typeId;
		var resourceId = cell.value.id;
		Ext.Ajax.request({
			url : 'model/getchildren',
			method : 'get',
			timeout : 90000,
			params : {
				id : resourceId
			},
			success : function(response) {
				var json = response.responseText;
				var children = Ext.decode(json);
				if (children.length != 0) {
					//add children vertex here
					graph.getModel().beginUpdate();
					try {
						for (var i = 0; i < children.length; i++) {
							//操作系统的服务和服务组件不在此显示
							if (children[i].typeId != 3 && children[i].typeId != 4) {
								var childObject = Ext.create('PaaSMonitor.model.Resource', children[i]);
								var child = graph.insertVertex(cell, childObject.get('name'), childObject.data, 0, 0, 48, 48, controller.getTypeString(childObject.get('typeId')));
								var root = graph.getDefaultParent();
								var parent_to_child = graph.insertEdge(root, null, '', cell, child);
							}
						}
					} finally {
						graph.getModel().endUpdate();
					}
				} else {
					//没有子节点
				}
			},
			failure : function(response) {
				Ext.MessageBox.alert('错误', '无法加载子节点');
			}
		});
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
			case 5:
				return 'AppServer';
			case 7:
				return 'AppInstance';
			default:
				return 'NotFound';
		}
	},

	getChildren : function(parent) {
		var id = parent.value.id;
		var edges = parent.edges;
		var children = new Array();
		if (edges == null)
			return children;
		for (var j = 0; j < edges.length; j++) {
			if (edges[j].source.value.id == id) {
				children.push(edges[j].target);
			}
		}
		return children;
	}
});
