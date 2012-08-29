Ext.define('PaaSMonitor.store.Vim', {
    extend: 'Ext.data.Store',
    requires: [
        'PaaSMonitor.model.Vim'
    ],

    constructor: function(cfg) {
        var me = this;
        cfg = cfg || {};
        me.callParent([Ext.apply({
            storeId: 'vimStore',
            model: 'PaaSMonitor.model.Vim'
        }, cfg)]);
    }
});