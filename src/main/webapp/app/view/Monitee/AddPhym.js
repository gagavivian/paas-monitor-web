Ext.define('PaaSMonitor.view.Monitee.AddPhym', {
	extend : 'Ext.panel.Panel',
	alias : 'widget.addphym',
	layout : {
		type : 'hbox',
		align : 'middle ',
		pack : 'center'
	},
	bodyPadding : 10,

	initComponent : function() {
		var me = this;

		Ext.applyIf(me, {
			items : [ {
				xtype : 'form',
				bodyPadding : 10,
				items : [ {
					xtype : 'textfield',
					name : 'ip',
					fieldLabel : 'IP',
					anchor : '100%',
					allowBlank : false
				}, {
					xtype : 'textfield',
					name : 'username',
					fieldLabel : 'User Name',
					anchor : '100%',
					allowBlank : false
				}, {
					xtype : 'textfield',
					inputType : 'password',
					name : 'password',
					fieldLabel : 'Password',
					anchor : '100%',
					allowBlank : false
				} ],
				dockedItems : [ {
					xtype : 'toolbar',
					dock : 'bottom',
					items : [ {
						xtype : 'tbfill'
					}, {
						xtype : 'button',
						handler : function(button, event) {
							this.up('form').getForm().reset();
						},
						text : 'Reset'
					}, {
						xtype : 'button',
						disabled : true,
						id : 'save_phym_button',
						text : 'Next',
						formBind : true
					} ]
				} ]
			} ]

		});

		me.callParent(arguments);
	}

});