Ext.define('PaaSMonitor.model.ResourcePropertyKey', {
    extend: 'Ext.data.Model',

    idProperty: 'id',

    fields: [
        {
            name: 'id'
        },
        {
            name: 'key'
        }
    ]
    /*
    ,

    proxy: {
        type: 'rest',
        timeout: 90000,
        url: 'resources'
    }
    */
});