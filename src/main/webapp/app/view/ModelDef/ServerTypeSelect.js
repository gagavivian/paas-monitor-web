Ext.define('PaaSMonitor.view.ModelDef.ServerTypeSelect', {
	extend : 'Ext.window.Window',
	alias : 'widget.servertypeselect',
	
	id : 'ServerTypeSelect',

	layout : 'fit',
	height : 250,
	width : 500,
	resizable : false,
	title : '选择服务器类型',
	
	vertical : true,

	closeAction : 'hide',

	modal : true,

	initComponent : function() {
		var me = this;
		
		var panel = Ext.create('Ext.panel.Panel', {
			height : 250,
			width : 550,
			items : [{
				xtype : 'radiogroup',
				fieldLabel: "请选择您所使用的服务器类型",
				columns: 3,
				vertical: false,
				items: [{
						boxLabel: "Apache Tomcat 6.0",
						name: "selectservertype",
						inputValue: '1',
						checked: true
					},{
						boxLabel: "Apache Tomcat 7.0",
						name: "selectservertype",
						inputValue: '2'					
					},{
						boxLabel: "Apache httd",
						name: "selectservertype",
						inputValue: '3'
					}]
			}]
		});
		/*
		var radioGroup = Ext.create('Ext.form.RadioGroup', {
			fieldLabel: "请选择您所使用的服务器类型",
			columns: 3,
			vertical: false,
			items: [{
					boxLabel: "Apache Tomcat 6.0",
					name: "selectservertype",
					inputValue: '1',
					checked: true
				},{
					boxLabel: "Apache Tomcat 7.0",
					name: "selectservertype",
					inputValue: '2'					
				},{
					boxLabel: "Apache httd",
					name: "selectservertype",
					inputValue: '3'
				}]
		});
		*/
		me.items = [panel];

		var ok = Ext.create('Ext.Button', {
			id : 'select_type_server',
			text : '确定',
		});

		var cancel = Ext.create('Ext.Button', {
			text : '取消',
			handler : function() {
				me.hide();
			}
		});

		me.buttons = [ok, cancel];
		
		me.on('show', function() {
			panel.down('radiogroup').reset();
		});

		me.callParent(arguments);
	}
}); 