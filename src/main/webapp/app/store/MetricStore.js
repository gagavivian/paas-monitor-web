Ext.define('PaaSMonitor.store.MetricStore', {
    extend: 'Ext.data.Store',
    
    requires: [
        'PaaSMonitor.model.Metric'
    ],

    constructor: function(cfg) {
        var me = this;
        cfg = cfg || {};
        me.callParent([Ext.apply({
            autoLoad: false,
            storeId: 'MetricStore',
            model: 'PaaSMonitor.model.Metric',
            pageSize: 10,            
            proxy: {
                type: 'ajax',
                url: 'metrics/all',                
                reader: {
                    type: 'json',
                    root: 'data'
                }
            }            
        }, cfg)]);
    }
});