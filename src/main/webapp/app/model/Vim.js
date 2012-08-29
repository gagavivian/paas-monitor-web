Ext.define('PaaSMonitor.model.Vim', {
    extend: 'Ext.data.Model',
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
            name: 'os'
        },
        {
            name: 'state'
        },
        {
            name: 'parentId'
        }
    ]
});