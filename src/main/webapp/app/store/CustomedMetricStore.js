Ext.define('PaaSMonitor.store.CustomedMetricStore', {
    extend: 'Ext.data.Store',
    
    requires: [
        'PaaSMonitor.model.Metric'
    ],

    constructor: function(cfg) {
        var me = this;
        cfg = cfg || {};
        me.callParent([Ext.apply({
            autoLoad: false,
            storeId: 'CustomedMetricStore',
            model: 'PaaSMonitor.model.Metric',
            pageSize: 10,            
            proxy: {
                type: 'ajax',
                url: 'metrics/customed',                
                reader: {
                    type: 'json',
                    root: 'data'
                }
            }            
        }, cfg)]);
    }
});