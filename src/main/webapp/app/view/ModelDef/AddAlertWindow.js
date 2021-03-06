Ext.define('PaaSMonitor.view.ModelDef.AddAlertWindow', {
	extend : 'Ext.window.Window',
	alias : 'widget.addalertwindow',
	
	requires : ['PaaSMonitor.store.EnabledMetricStore', 'PaaSMonitor.store.ConditionStore'],

	id : 'AddAlertWindow',

	layout : 'form',
	height : 400,
	width : 600,
	title : '添加Alert',

	closeAction : 'hide',

	modal : true,

	initComponent : function() {
		var me = this;

		//在此处添加组件
		
		// Create the combo box, attached to the states data store
		/* for next 
		var metricComboBox = Ext.create('Ext.form.ComboBox', {
			fieldLabel: '选择要添加Metric',
			store: 'EnabledMetricStore',
			trigerAction: 'all',
			queryMode: 'remote',
			editable: false,
			displayField: 'templateName',
			valueField: 'id',
			pageSize: 10
		});
		
		var conditionComboBox = Ext.create('Ext.form.ComboBox', {
			fieladLabel: '条件',
			store: 'ConditionStore',
			queryMode: 'local',
			trigerAction: 'all',
			displayField: 'condition', 
			editable: false
		});
		
		var conditionValue = Ext.create('Ext.form.field.Text', {
			name: 'value',
			fieldLabel: '值',
		});
		
		var valueChangeRadio = Ext.create('Ext.form.field.Radio', {
			name: 'alert',
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
			name: 'alert',
			boxLabel: '条件',
			inputValue: 'condition',
			checked: true,
			listeners: {
				'check':function() {
					conditionCombobox.setDisable(false);
					conditionValue.setDisable(false);
				}
			}
		});
		
		var radioGroup = Ext.create('Ext.form.RadioGroup', {
			fieldLabel: '选择Alert的条件',
			vertical: true,
			items: [valueChangeRadio, conditionRadio]
		});
		
		var emailText = Ext.create('Ext.form.field.Text', {
			name: 'email',
			fieldLabel: 'E-mail',
			disabled: false,
			width: 150,
			vtype: 'email',
			vtypeText: "邮件地址有误"
		});
		
		me.items = [metricComboBox, radioGroup, conditionComboBox, conditionValue, emailText];
		*/

		var metricComboBox = Ext.create('Ext.form.ComboBox', {
			id: 'alert-metric',
			fieldLabel: '选择要添加Metric',
			store: 'EnabledMetricStore',
			trigerAction: 'all',
			queryMode: 'remote',
			editable: false,
			displayField: 'templateName',
			valueField: 'id',
			pageSize: 10
		});
		
		var conditionComboBox = Ext.create('Ext.form.ComboBox', {
			id: 'alert-comparator',
			fieldLabel: '条件',
			labelWidth: 30,
			store: 'ConditionStore',
			queryMode: 'local',
			trigerAction: 'all',
			displayField: 'condition', 
			editable: false
		});
		
		var conditionValue = Ext.create('Ext.form.field.Text', {
			id: 'alert-value',
			name: 'value',
			fieldLabel: '值',
		});
		
		var emailText = Ext.create('Ext.form.field.Text', {
			id: 'alert-email',
			name: 'email',
			fieldLabel: 'E-mail',
			labelWidth: 30,
			disabled: false,
			width: 150,
			vtype: 'email',
			vtypeText: "邮件地址有误"
		});
		
		me.items = [metricComboBox, conditionComboBox, conditionValue, emailText];
		
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