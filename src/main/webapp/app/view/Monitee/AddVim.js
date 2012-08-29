Ext.define('PaaSMonitor.view.Monitee.AddVim', {
	extend : 'Ext.panel.Panel',
	alias : 'widget.addvim',

	layout : {
		type : 'hbox',
		align : 'middle ',
		pack : 'center'
	},

	initComponent : function() {
		var me = this;

		Ext.applyIf(me, {
			items : [ {
				xtype : 'grid',
				store : 'Vim',
				width : 700,
				height : 400,
				columns : [ {
					xtype : 'gridcolumn',
					dataIndex : 'ip',
					flex : 1,
					text : 'IP'
				}, {
					xtype : 'gridcolumn',
					dataIndex : 'name',
					flex : 1,
					text : 'Name'
				}, {
					xtype : 'gridcolumn',
					dataIndex : 'state',
					flex : 1,
					text : 'Power State'
				}, {
					xtype : 'gridcolumn',
					dataIndex : 'os',
					text : 'Operating System',
					flex : 1
				} ],
				viewConfig : {

				},
				selModel : Ext.create('Ext.selection.CheckboxModel', {

				}),
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
						id : 'save_selected_vims_button',
						text : 'Next'
					} ]
				} ]
			} ],
		});

		me.callParent(arguments);
	}

});