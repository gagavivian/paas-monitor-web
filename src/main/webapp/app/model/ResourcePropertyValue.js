Ext.define('PaaSMonitor.model.ResourcePropertyValue', {
    extend: 'Ext.data.Model',

    idProperty: 'id',

    fields: [
        {
            name: 'id'
        },
        {
            name: 'value'
        },
        {
            name: 'resourcePropertyKey'
        }
    ],

    proxy: {
        type: 'rest',
        timeout: 90000,
        url: 'resources'
    }
});