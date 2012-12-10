Ext.define('PaaSMonitor.store.ConditionStore', {
	extend : 'Ext.data.Store',

	constructor : function(cfg) {
		var me = this;
		cfg = cfg || {};
		me.callParent([ Ext.apply({
			autoLoad : true,
			storeId : 'ConditionStore',
			fields : [ {
				name : 'condition'
			} ],
			data : [ {
				condition : '='
			}, {
				condition : '!='
			}, {
				condition : '<'
			}, {
				condition : '>'
			} ]
		}, cfg) ]);
	}
});