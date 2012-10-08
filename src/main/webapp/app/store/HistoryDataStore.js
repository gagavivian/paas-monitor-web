Ext.define('PaaSMonitor.store.HistoryDataStore', {
    extend: 'Ext.data.Store',
    
    requires: [
        'PaaSMonitor.model.HistoryData'
    ],

    constructor: function(cfg) {
        var me = this;
        cfg = cfg || {};
        me.callParent([Ext.apply({
            autoLoad: false,
            storeId: 'HistoryStore',
            model: 'PaaSMonitor.model.HistoryData',           
            proxy: {
                type: 'ajax',
                url: 'metrics/history',                
                reader: {
                    type: 'json',
                    root: 'data'
                }
            }            
        }, cfg)]);
    }
});