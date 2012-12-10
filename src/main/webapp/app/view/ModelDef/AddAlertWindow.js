Ext.define('PaaSMonitor.view.ModelDef.AddAlertWindow', {
	extend : 'Ext.window.Window',
	alias : 'widget.addalertwindow',
	
	requires : ['PaaSMonitor.store.CustomedMetricStore', 'PaaSMonitor.store.ConditionStore'],

	id : 'AddAlertWindow',

	layout : 'fit',
	height : 250,
	width : 400,
	title : '添加Alert',

	closeAction : 'hide',

	modal : true,

	initComponent : function() {
		var me = this;

		//在此处添加组件
		
		// Create the combo box, attached to the states data store
		var metricComboBox = Ext.create('Ext.form.ComboBox', {
			fieldLabel: '选择要添加Metric的Alert',
			store: 'CustomedMetricStore',
			trigerAction: all,
			queryMode: 'remote',
			displayField: 'name',
			valueField: 'id',
			dockedItems : [{
				xtype : 'pagingtoolbar',
				store : 'CustomedMetricStore',
				dock : 'bottom',
				displayInfo : true
			}]
		});
		
		var conditionComboBox = Ext.create('Ext.form.ComboBox', {
			fieladLabel: '条件',
			store: 'ConditionStore',
			queryMode: 'local',
			trigerAction: all,
			displayField: 'condition', 
			disabled: true,
			editable: false
		});
		
		var conditionValue = Ext.create('Ext.form.field.TextArea', {
			name: 'value',
			fieldLabel: '',
			disabled: true
		});
		
		var valueChangeRadio = Ext.create('Ext.form.field.Radio', {
			boxLabel: '当值变化时',
			inputValue: 'valueChange',
			listeners: {
				'check':function() {
					conditionCombobox.setDisable(true);
					conditionValue.setDisable(true);
				}
			}
		});
		
		var conditionRadio = Ext.create('Ext.form.field.Radio', {
			boxLabel: '条件',
			inputValue: 'condition',
			listeners: {
				'check':function() {
					conditionCombobox.setDisable(false);
					conditionValue.setDisable(false);
				}
			}
		});
		
		var radioGroup = Ext.create('Ext.form.RadioGroup', {
			fieldLabel: '选择Alert的条件',
			layout: 'column',
			items: [{
				columnWidth: .45,
				items:[conditionRadio, valueChangeRadio]
			}, {
				columnWidth: .25,
				items:[conditionComboBox]
			}, {
				columnWidth: .30,
				items:[conditionValue]
			}]
		});
		
		var emailText = Ext.create('Ext.form.field.TextArea', {
			name: 'email',
			fieldLabel: 'E-mail',
			disabled: false,
			vtype: 'email',
			vtypeText: "邮件地址有误"
		});
		
		me.items = [metricComboBox, radioGroup];

		var ok = Ext.create('Ext.Button', {
			id : 'add_alert_button',
			text : '添加Alert',
		});

		var cancel = Ext.create('Ext.Button', {
			text : '取消',
			handler : function() {
				me.hide();
			}
		});

		me.buttons = [ok, cancel];

		me.callParent(arguments);
	}
}); 