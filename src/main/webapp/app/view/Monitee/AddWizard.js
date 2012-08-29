Ext.define('PaaSMonitor.view.Monitee.AddWizard', {
	extend : 'Ext.panel.Panel',
	alias : 'widget.addwizard',
	requires : [ 'PaaSMonitor.view.Monitee.AddPhym',
			'PaaSMonitor.view.Monitee.AddVim' ],

	layout : {
		type : 'card'
	},
	title : 'Add New Monitee',

	initComponent : function() {
		var me = this;

		Ext.applyIf(me, {
			items : [ {
				id : 'addphym',
				xtype : 'addphym'
			}, {
				id : 'addvim',
				xtype : 'addvim'
			} ]
		});

		me.callParent(arguments);
	}

});