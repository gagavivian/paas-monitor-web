Ext.define('PaaSMonitor.store.MetricTemplateStore', {
    extend: 'Ext.data.Store',
    
    requires: [
               'PaaSMonitor.model.MetricTemplate'
    ],

    constructor: function(cfg) {
        var me = this;
        cfg = cfg || {};
        /*
        me.callParent([Ext.apply({
            autoLoad: false,
            storeId: 'MetricTemplateStore',
            model: 'PaaSMonitor.model.MetricTemplate',
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
        */
    }
});