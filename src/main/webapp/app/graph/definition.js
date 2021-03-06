
// The window of adding mappings
var mappingWin;

//The window of adding a new attribute to a class
var addAttributeWin;
var showPropertyWin;









function addAttribute(graph, cell, attributePro) {
	if(addAttributeWin == null) {
		var nameField = Ext.create('Ext.form.field.Text', {
			fieldLabel : 'Name',
			name : 'name',
			allowBlank : false
		});
		var types = Ext.create('Ext.data.Store', {
			fields : ['name'],
			data : [{
				"name" : "String"
			}, {
				"name" : "int"
			}, {
				"name" : "long"
			}, {
				"name" : "boolean"
			}]
		});
		var typeField = Ext.create('Ext.form.field.ComboBox', {
			fieldLabel : 'Type',
			store : types,
			queryMode : 'local',
			displayField : 'name',
			valueField : 'name'
		});
		var categories = Ext.create('Ext.data.Store', {
			fields : ['name'],
			data : [{
				"name" : "Config"
			}, {
				"name" : "Monitor"
			}, {
				"name" : "Control"
			}]
		});
		var categoryField = Ext.create('Ext.form.field.ComboBox', {
			fieldLabel : 'Category',
			store : categories,
			queryMode : 'local',
			displayField : 'name',
			valueField : 'name'
		});
		var form = Ext.create('Ext.form.Panel', {
			bodyPadding : 5,
			layout : 'anchor',
			defaults : {
				anchor : '100%'
			},
			defaultType : 'textfield',
			items : [nameField, typeField, categoryField],
			// Reset and Submit buttons
			buttons : [{
				text : 'Submit',
				formBind : true, //only enabled once the form is valid
				handler : function() {
					var form = this.up('form').getForm();
					if(form.isValid()) {
						var childrenNum = cell.getChildCount();
						var attribute = attributePro.clone();
						attribute.value.name = nameField.getValue();
						attribute.value.type = typeField.getValue();
						attribute.value.category = categoryField.getValue();
						graph.model.beginUpdate();
						try {							
								graph.addCell(attribute, cell);							
						} finally {
							graph.model.endUpdate();
						}
						addAttributeWin.hide();
					}
				}
			}, {
				text : 'Cancel',
				handler : function() {
					this.up('form').getForm().reset();
					this.up('window').hide();
				}
			}]
		});
		var addAttributeWin = Ext.create('Ext.window.Window', {
			title : 'Add a new attribute',
			layout : 'fit',
			width : 300,
			height : 150,
			items : [form]
		});
	}
	addAttributeWin.show();
};

function showProperties(graph, cell) {
	if(showPropertyWin == null) {
		var nameField = Ext.create('Ext.form.field.Text', {
			fieldLabel : 'Name',
			name : 'name',
			allowBlank : false
		});
		nameField.setRawValue(cell.value.name);
		var types = Ext.create('Ext.data.Store', {
			fields : ['name'],
			data : [{
				"name" : "String"
			}, {
				"name" : "int"
			}, {
				"name" : "long"
			}, {
				"name" : "boolean"
			}]
		});
		var typeField = Ext.create('Ext.form.field.ComboBox', {
			fieldLabel : 'Type',
			store : types,
			queryMode : 'local',
			displayField : 'name',
			valueField : 'name'
		});

		typeField.setRawValue(cell.value.type);
		var categories = Ext.create('Ext.data.Store', {
			fields : ['name'],
			data : [{
				"name" : "Config"
			}, {
				"name" : "Monitor"
			}, {
				"name" : "Control"
			}]
		});
		var categoryField = Ext.create('Ext.form.field.ComboBox', {
			fieldLabel : 'Category',
			store : categories,
			queryMode : 'local',
			displayField : 'name',
			valueField : 'name'
		});
		categoryField.setRawValue(cell.value.category);
		var form = Ext.create('Ext.form.Panel', {
			bodyPadding : 5,
			layout : 'anchor',
			defaults : {
				anchor : '100%'
			},
			items : [nameField, typeField, categoryField],
			// Reset and Submit buttons
			buttons : [{
				text : 'Submit',
				formBind : true, //only enabled once the form is valid
				handler : function() {
					var form = this.up('form').getForm();
					if(form.isValid()) {
						var clone = cell.value.clone();
						;
						clone.name = nameField.getValue();
						clone.type = typeField.getValue();
						clone.category = categoryField.getValue();
						graph.model.setValue(cell, clone);
						showPropertyWin.hide();
					}
				}
			}, {
				text : 'Cancel',
				handler : function() {
					this.up('form').getForm().reset();
					this.up('window').hide();
				}
			}]
		});
		var showPropertyWin = Ext.create('Ext.window.Window', {
			title : 'Properties of ' + cell.value.name,
			layout : 'fit',
			width : 300,
			height : 150,
			items : [form]
		});
	}
	showPropertyWin.show();


};

function createEdgeTemplate(graph, name, icon, style, width, height, value) {
	var cells = [new mxCell((value != null) ? value : '', new mxGeometry(0, 0, width, height), style)];
	cells[0].geometry.setTerminalPoint(new mxPoint(0, height), true);
	cells[0].geometry.setTerminalPoint(new mxPoint(width, 0), false);
	cells[0].edge = true;

	var funct = function(graph, evt, target) {
		cells = graph.getImportableCells(cells);

		if(cells.length > 0) {
			var validDropTarget = (target != null) ? graph.isValidDropTarget(target, cells, evt) : false;
			var select = null;

			if(target != null && !validDropTarget) {
				target = null;
			}

			var pt = graph.getPointForEvent(evt);
			var scale = graph.view.scale;

			pt.x -= graph.snap(width / 2);
			pt.y -= graph.snap(height / 2);
			select = graph.importCells(cells, pt.x, pt.y, target);

			graph.scrollCellToVisible(select[0]);
			graph.setSelectionCells(select);
		}
	};
	var node = createImg(name, icon);

	// Installs a click handler to set the edge template
	mxEvent.addListener(node, 'mousedown', function(evt) {
		edgeTemplate = cells[0];
	});
	// Creates the element that is being shown while the drag is in progress
	var dragPreview = document.createElement('div');
	dragPreview.style.border = 'dashed black 1px';
	dragPreview.style.width = width + 'px';
	dragPreview.style.height = height + 'px';

	mxUtils.makeDraggable(node, graph, funct, dragPreview, -width / 2, -height / 2, graph.autoscroll, true, false);

	return node;
};

function createImg(name, icon) {
	var node = mxUtils.createImage(icon);
	node.setAttribute('title', mxResources.get(name) || name);

	if(node.nodeName == 'IMG') {
		node.setAttribute('alt', mxResources.get(name) || name);

		if(mxClient.IS_TOUCH) {
			node.setAttribute('width', '36');
			node.setAttribute('height', '36');
		} else {
			node.setAttribute('width', '26');
			node.setAttribute('height', '26');
		}

		node.setAttribute('hspace', '5');
		node.setAttribute('vspace', '5');
	} else {
		node.style.width = '26px';
		node.style.height = '26px';
		node.style.margin = '5px';
		node.style.display = 'inline';
	}

	return node;
};


function addConfigs(object, cell, config) {
	for(attri in object) {
		if(attri != 'name' && attri != 'clone') {
			var temp = config.clone();
			temp.value.name = attri;
			temp.value.category = 'Config';
			cell.insert(temp);
		}
	}
}

function addBlankAttribute(object, cell, config) {	
			var temp = config.clone();	
			temp.value.name = '';
			temp.value.category = '';		
			cell.insert(temp);		
}




function mapping(graph, cell) {

	if(mappingWin == null) {

		var gridStore = Ext.create('Ext.data.Store', {
			storeId : 'gridStore',
			model : 'PaaSMonitor.model.MBeanAttribute'
		});

		var upperRightPanel = Ext.create('Ext.container.Container', {
			width : 400,
			id : 'upperRightPanel',
			layout : 'fit',
			height : 260
		});

		var attributeGridPanel = Ext.create('Ext.grid.Panel', {
			id : 'attributeGridPanel',
			title : 'Added Mappings',
			padding : '10, 0, 0, 0',
			columns : [{
				header : 'Name',
				dataIndex : 'name'
			}, {
				header : 'ObjectName',
				dataIndex : 'objectName',
				flex : 2
			}, {
				header : 'Version',
				dataIndex : 'version'
			}, {
				header : 'Type',
				dataIndex : 'type'
			}],
			store : gridStore,
			listeners : {
				'itemclick' : function(view, record) {
					codePanel.setVisible(true);
					codeArea.enable();
					codeArea.setRawValue(record.get('code'));
				}
			}
		});

		attributeGridPanel.setVisible(false);

		var codeArea = Ext.create('Ext.form.field.TextArea', {
			anchor : '-20, -20',
			emptyText : 'Object transform(Object){}',
			disabled : true,
			padding : 10,
			listeners : {
				'blur' : function(thisField, options) {
					var selected = attributeGridPanel.getSelectionModel().getSelection();
					selected[0].data.code = thisField.getRawValue();
					codePanel.setVisible(false);
				}
			}
		});

		var rightPanel = Ext.create('Ext.container.Container', {
			width : 400,
			id : 'rightPanel',
			layout : 'anchor',
			items : [upperRightPanel, attributeGridPanel]
		});

		var codePanel = Ext.create('Ext.panel.Panel', {
			width : 195,
			id : 'codePanel',
			title : 'Code Area',
			layout : 'anchor',
			items : [codeArea],
			margin : '0, 0, 0, 5'

		});
		codePanel.setVisible(false);
		var attributesStore;
		var showForm = function(view, record) {
			if(record.get('leaf')) {
				var version = this.up('tabpanel').getActiveTab().id;
				var dnName = record.parentNode.data.text;
				var typeName = record.data.text;
				attributesStore = Ext.create('Ext.data.Store', {
					model : 'PaaSMonitor.model.MBeanAttribute',
					proxy : {
						type : 'ajax',
						extraParams : {
							version : version,
							dnName : dnName,
							typeName : typeName
						},
						url : 'jmx/mbeanattributes',
						reader : {
							type : 'json',
							root : 'data'
						}
					},
					autoLoad : true

				});

				var attribute = Ext.create('Ext.form.ComboBox', {
					fieldLabel : 'Attribute',
					store : attributesStore,
					queryMode : 'local',
					displayField : 'name',
					// valueField : 'type'
				});

				var ajax = Ext.Ajax.request({
					url : 'jmx/mbeaninfo',
					params : {
						version : version,
						dnName : dnName,
						typeName : typeName
					},
					method : 'get',
					success : function(response) {
						upperRightPanel.removeAll();

						var treeDetail = Ext.create('widget.form', {
							title : 'MBean Detail',
							bodyPadding : 20,
							autoheight : true,
							layout : 'anchor',
							defaults : {
								anchor : '100%'
							},
							defaultType : 'textfield',
							buttons : [{
								text : 'Reset',
								handler : function() {
									this.up('form').getForm().reset();
								}
							}, {
								text : 'Add',
								formBind : true, // only enabled once the
								// form is valid
								disabled : true,
								handler : function() {
									var form = this.up('form').getForm();
									if(form.isValid()) {
										var newItem = Ext.create('PaaSMonitor.model.MBeanAttribute');
										var objectName = dnName + ':type=' + typeName;
										var fields = form.getFields().items;
										// Don't add attribute to objectName
										for(var i = 0; i < fields.length - 1; i++) {
											objectName += ',' + fields[i].getFieldLabel() + '=' + fields[i].getValue();

										}
										newItem.set('name', attribute.displayTplData[0].name);
										newItem.set('objectName', objectName);
										newItem.set('version', version);
										newItem.set('type', attribute.displayTplData[0].type)
										gridStore.add(newItem);
										attributeGridPanel.setVisible(true);

									}
								}
							}]
						});
						treeDetail.add(Ext.decode(response.responseText).data);
						treeDetail.add(attribute);
						treeDetail.doLayout();
						upperRightPanel.add(treeDetail);
						upperRightPanel.doLayout();
					}
				});
			}

		};
		var tomcat6Tree = Ext.create('Ext.tree.Panel', {
			id : 'tomcat6',
			title : 'Tomcat 6',
			height : 300,
			width : 200,
			rootVisible : false,
			autoScroll : true,
			collapsible : true,
			store : Ext.create('Ext.data.TreeStore', {
				proxy : {
					type : 'ajax',
					url : 'data/tomcat6-tree.txt'
				},
				root : {
					expanded : true
				}
			}),
			listeners : {
				'itemclick' : showForm
			}
		});

		var tomcat7Tree = Ext.create('Ext.tree.Panel', {
			id : 'tomcat7',
			title : 'Tomcat 7',
			height : 300,
			width : 200,
			rootVisible : false,
			autoScroll : true,
			collapsible : true,
			store : Ext.create('Ext.data.TreeStore', {
				proxy : {
					type : 'ajax',
					url : 'data/tomcat7-tree.txt'
				},
				root : {
					expanded : true
				}
			}),
			listeners : {
				'itemclick' : showForm
			}
		});

		var jettyTree = Ext.create('Ext.tree.Panel', {
			id : 'jetty8',
			title : 'Jetty 8',
			height : 300,
			width : 200,
			rootVisible : false,
			autoScroll : true,
			collapsible : true,
			store : Ext.create('Ext.data.TreeStore', {
				proxy : {
					type : 'ajax',
					url : 'data/jetty-tree.txt'
				},
				root : {
					expanded : true
				}
			}),
			listeners : {
				'itemclick' : showForm
			}
		});
		mappingWin = Ext.create('widget.window', {
			title : 'Please choose the mapping',
			closable : true,
			closeAction : 'hide',
			//animateTarget: this,
			width : 900,
			height : 550,
			layout : {
				type : 'hbox', // Arrange child items vertically
				align : 'stretch', // Each takes up full width
				padding : 5
			},
			bodyStyle : 'padding: 5px;',
			items : [{
				xtype : 'tabpanel',
				width : 250,
				items : [tomcat6Tree, tomcat7Tree, jettyTree],
				margin : '0, 5, 0, 0'
			}, rightPanel, codePanel]
		});
	}

	var submitButton = Ext.create('Ext.button.Button', {
		text : 'Submit',
		id : 'mappingSubmitButton',
		width : 100,
		dock : 'bottom',
		handler : function() {
			var gridPanel = this.up('window').down('gridpanel');
			var result = gridPanel.getStore();
			if(result == null || result == undefined || result.getCount() <= 0)
				alert("No mapping has been added!");
			else {
				var clone = cell.value.clone();
				clone.mapped = true;
				var items = result.data.items;
				var mappingArray = new Array();
				for(var i = 0; i < result.getCount(); i++) {
					var e = items[i].data;
					mappingArray.push(e);
				}
				clone.mapping = Ext.encode(mappingArray);
				graph.model.setValue(cell, clone);
				Ext.getCmp('upperRightPanel').removeAll();
				result.removeAll();
				gridPanel.setVisible(false);
				Ext.getCmp('codePanel').setVisible(false);
				mappingWin.hide();
			}
		}
	});
	mappingWin.remove('bottomBar');
	mappingWin.addDocked({
		xtype : 'toolbar',
		id : 'bottomBar',
		dock : 'bottom',
		ui : 'footer',
		items : [{
			xtype : 'component',
			flex : 1
		}, submitButton]
	});
	mappingWin.show();
}