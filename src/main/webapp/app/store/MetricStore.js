Ext.define('PaaSMonitor.store.MetricStore', {
    extend: 'Ext.data.Store',
    
    requires: [
        'PaaSMonitor.store.MetricModel'
    ],

    constructor: function(cfg) {
        var me = this;
        cfg = cfg || {};
        me.callParent([Ext.apply({
            autoLoad: true,
            storeId: 'MetricStore',
            model: 'PaaSMonitor.model.MetricModel',
            pageSize: 10,	
            proxy: {
                type: 'ajax',
                url: 'resources/data/MetricTemplate.json',
                reader: {
                    type: 'json',
                    root: 'data'
                }
            }
        }, cfg)]);
    }
});