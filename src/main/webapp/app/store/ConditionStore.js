Ext.define('PaaSMonitor.store.ConditionStore', {
	extend : 'Ext.data.ArrayStore',

	constructor : function(cfg) {
		var me = this;
		cfg = cfg || {};
		me.callParent([ Ext.apply({
			autoLoad : true,
			storeId : 'ConditionStore',
			fields : [ 'condition' ],
			data : [ [ '=' ], [ '!=' ], [ '<' ], [ '>' ] ]
		}, cfg) ]);
	}
});