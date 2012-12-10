Ext.define('PaaSMonitor.store.EnabledMetricStore', {
    extend: 'Ext.data.Store',
    
    requires: [
        'PaaSMonitor.model.Metric'
    ],

    constructor: function(cfg) {
        var me = this;
        cfg = cfg || {};
        me.callParent([Ext.apply({
            autoLoad: false,
            storeId: 'EnabledMetricStore',
            model: 'PaaSMonitor.model.Metric',
            pageSize: 10,            
            proxy: {
                type: 'ajax',
                url: 'metrics/enabled',                
                reader: {
                    type: 'json',
                    root: 'data'
                }
            }            
        }, cfg)]);
    }
});