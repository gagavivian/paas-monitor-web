Ext.define('PaaSMonitor.model.Resource', {
    extend: 'Ext.data.Model',

    idProperty: 'id',

    fields: [
        {
            name: 'id'
        },
        {
            name: 'name'
        },
        {
            name: 'ip'
        },
        {
            name: 'typeId'
        },
        {
            name: 'resourcePrototype'
        },
        {
            name: 'resourcePropertyValues'
        }
    ],

    proxy: {
        type: 'rest',
        timeout: 90000,
        url: 'resources'
    }
});