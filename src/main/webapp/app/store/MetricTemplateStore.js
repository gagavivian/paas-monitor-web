Ext.define('PaaSMonitor.store.MetricTemplateStore', {
    extend: 'Ext.data.Store',
    
    requires: [
               'PaaSMonitor.store.MetricTemplateModel'
    ],

    constructor: function(cfg) {
        var me = this;
        cfg = cfg || {};
        me.callParent([Ext.apply({
            autoLoad: true,
            storeId: 'MetricTemplateStore',
            model: 'PaaSMonitor.model.MetricTemplateModel',
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