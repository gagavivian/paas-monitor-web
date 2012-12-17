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

		//添加监听双击操作的listener
		graph.addListener(mxEvent.DOUBLE_CLICK, function(sender, evt) {
			var cell = evt.getProperty('cell');
			if (cell.isVertex()) {
				var style = cell.style;
				var children = controller.getChildren(cell);
				if (children.length === 0) {
					controller.expandChildren(this, cell);
					//这个地方的layout到底如何设置，还需要进一步完善
					//hierarchicalLayout.execute(parent);
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
			treeLayout.execute(parent);
		} finally {
			graph.getModel().endUpdate();
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

	adjustLayout : function(graph, root) {
		var treeLayout = new mxCompactTreeLayout(graph);
		treeLayout.intraCellSpacing = 50;
		treeLayout.execute(root);
	},

	parseModelData : function(graph, modelData) {
		var parent = graph.getDefaultParent();
		var space = 100;
		for (var i = 0; i < modelData.length; i++) {
			var phymObject = Ext.create('PaaSMonitor.model.Resource', modelData[i]);
			var phym = graph.insertVertex(parent, phymObject.name, phymObject.data, 30, space * i, 48, 48, 'Phym');
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
		collectionStyle = createMoniteeStyleObject(image_path + 'collection.jpg');
		graph.getStylesheet().putCellStyle('Collection', collectionStyle);
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
		var resourceId = cell.value.id;
		// 如果当前的cell是集合类型的，则从相应的store中读出子结点来并添加
		if (resourceId < 0) {
			// 应用实例集合
			var storeId = cell.value.name;
			var tmpStore = Ext.data.StoreManager.lookup(storeId);
			tmpStore.each(function(record) {
				var childObject = Ext.create('PaaSMonitor.model.Resource', record.data);
				var type = controller.getTypeString(childObject.get('typeId'));
				var child = graph.insertVertex(cell, childObject.get('name'), childObject.data, 0, 0, 48, 48, type);
				var root = graph.getDefaultParent();
				var parent_to_child = graph.insertEdge(root, null, '', cell, child);
			});
		}
		// 如果当前的cell是操作系统层的，则要向服务器请求相应的子结点类型
		// 并将相应的字节点存储到system-service store和app-server store中去
		else {
			Ext.Ajax.request({
				url : 'model/getchildren',
				method : 'get',
				timeout : 90000,
				params : {
					id : resourceId
				},
				success : function(response) {
					var resourceTypeId = cell.value.typeId;
					var json = response.responseText;
					var children = Ext.decode(json);
					if (children.length != 0) {
						graph.getModel().beginUpdate();
						try {
							
							if (resourceTypeId == 2) {
								for (var i = 0; i < children.length; i++) {
									//操作系统的服务和服务组件不在此显示							
									var typeId = children[i].typeId;
									var type = controller.getTypeString(typeId);
									if (typeId != 5) {
										var storeId = 'system-service';
										var tmpStore = Ext.data.StoreManager.lookup(storeId);
										if (tmpStore == undefined || tmpStore == null) {
											tmpStore = Ext.create("Ext.data.Store", {
												storeId : storeId,
												model : 'PaaSMonitor.model.Resource',
												proxy : {
													type : 'memory',
													reader : {
														type : 'json'
													}
												}
											});
											var childObject = Ext.create('PaaSMonitor.model.Resource', {
													id : -1,
													name : storeId,
													typeId : -1,
													resourcePrototype : {
														id : -1,
														name : storeId
													}
											});
											var child = graph.insertVertex(cell, childObject.get('name'), childObject.data, 0, 0, 48, 48, controller.getTypeString(-1));
											var root = graph.getDefaultParent();
											var parent_to_child = graph.insertEdge(root, null, '', cell, child);
										}
										tmpStore.add(children[i]);
									}
									// 如果当前的监控项目是server，则存储到app-servers store中
									else {
										var _storeId = 'app-servers';
										var tmpStore = Ext.data.StoreManager.lookup(storeId);
										if (tmpStore == undefined || tmpStore == null) {
											tmpStore = Ext.create("Ext.data.Store", {
												storeId : _storeId,
												model : 'PaaSMonitor.model.Resource',
												proxy : {
													type : 'memory',
													reader : {
														type : 'json'
													}
												}
											});
											var childObject = Ext.create('PaaSMonitor.model.Resource', {
													id : -1,
													name : _storeId,
													typeId : -1,
													resourcePrototype : {
														id : -1,
														name : _storeId
													}
											});
											var child = graph.insertVertex(cell, childObject.get('name'), childObject.data, 0, 0, 48, 48, controller.getTypeString(-1));
											var root = graph.getDefaultParent();
											var parent_to_child = graph.insertEdge(root, null, '', cell, child);
										}
										tmpStore.add(children[i]);
									}
								}
							}
							else if (resourceTypeId == 5) {
								for (var i = 0; i < children.length; i++) {
									var typeId = children[i].typeId;
									var type = controller.getTypeString(typeId);
									var resourceName = children[i].name;
									// 如果当前的监控项目是server级别的，则存储到server-config store中
									if (resourceName.indexOf(" Servlet Monitor") == -1 &&
											resourceName.indexOf(" JSP Monitor") == -1){
										var _storeId = 'server-config';
										var tmpStore = Ext.data.StoreManager.lookup(storeId);
										if (tmpStore == undefined || tmpStore == null) {
											tmpStore = Ext.create("Ext.data.Store", {
												storeId : _storeId,
												model : 'PaaSMonitor.model.Resource',
												proxy : {
													type : 'memory',
													reader : {
														type : 'json'
													}
												}
											});
											var childObject = Ext.create('PaaSMonitor.model.Resource', {
													id : -1,
													name : _storeId,
													typeId : -1,
													resourcePrototype : {
														id : -1,
														name : _storeId
													}
											});
											var child = graph.insertVertex(cell, childObject.get('name'), childObject.data, 0, 0, 48, 48, controller.getTypeString(-1));
											var root = graph.getDefaultParent();
											var parent_to_child = graph.insertEdge(root, null, '', cell, child);
										}
										tmpStore.add(children[i]);
									}
									// 如果当前的监控项目是应用级别的，则存储到
									else {
										
										// 获取app name
										var startIndex = resourceName.indexOf("//") + 2;
										var subStr = resourceName.substr(startIndex);
										var appPath = subStr.split(" ")[0];
										var tmp = appPath.split("/");
										var appName = tmp[tmp.length - 1];

										// 获取servlet name
										if (resourceName.indexOf(" Servlet Monitor") != -1) {
											var servletName = resourceName.split(" ")[3];
											children[i].resourcePrototype.name = servletName;
										}
										
										var _storeId = 'App Instances';
										var appInstanceStore = Ext.data.StoreManager.lookup(_storeId);
										if (appInstanceStore == undefined || appInstanceStore == null) {
											appInstanceStore  = Ext.create("Ext.data.Store", {
												storeId : _storeId,
												model : 'PaaSMonitor.model.Resource',
												proxy : {
													type : 'memory',
													reader : {
														type : 'json'
													}
												}
											});
											
											var childObject = Ext.create('PaaSMonitor.model.Resource', {
													id : -1,
													name : _storeId,
													typeId : -1,
													resourcePrototype : {
														id : -1,
														name : _storeId
													}
											});
											var child = graph.insertVertex(cell, childObject.get('name'), childObject.data, 0, 0, 48, 48, controller.getTypeString(-1));
											var root = graph.getDefaultParent();
											var parent_to_child = graph.insertEdge(root, null, '', cell, child);
										}
										var appStore = Ext.data.StoreManager.lookup(appName);
										if (appStore == undefined || appStore == null) {
											appStore  = Ext.create("Ext.data.Store", {
												storeId : appName,
												model : 'PaaSMonitor.model.Resource',
												proxy : {
													type : 'memory',
													reader : {
														type : 'json'
													}
												}
											});
											var childObject = Ext.create('PaaSMonitor.model.Resource', {
													id : -1,
													name : appName,
													typeId : -1,
													resourcePrototype : {
														id : -1,
														name : appName
													}
											});
											
											appInstanceStore.add(childObject);
											
										}
										appStore.add(children[i]);	
									}
								}
							}
							else {
								for (var i = 0; i < children.length; i++) {
									var typeId = children[i].typeId;
									var type = controller.getTypeString(typeId);
									var childObject = Ext.create('PaaSMonitor.model.Resource', children[i]);
									var child = graph.insertVertex(cell, childObject.get('name'), childObject.data, 0, 0, 48, 48, type);
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
					//此处调整layout不起作用，待修改
					controller.adjustLayout(graph, cell);
				},
				failure : function(response) {
					Ext.MessageBox.alert('错误', '无法加载子节点');
				}
			});
		}
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
				chart.axes.items[1].maximum = records[records.length-1].data.timestamp;
				chart.axes.items[1].step = [Ext.Date.MINUTE, 60];
				chart.refresh();
			}
		});

		historyDataWindow.show();		
	}
});
