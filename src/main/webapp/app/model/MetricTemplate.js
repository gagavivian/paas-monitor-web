Ext.define('PaaSMonitor.model.MetricTemplate', {
    extend: 'Ext.data.Model',

    idProperty: 'id',
    
    fields: [
        {
            name: 'alias'
        },
        {
            name: 'category'
        },
        {
            name: 'collectionType'
        },
        {
            name: 'defaultInterval'
        },
        {
            name: 'defaultOn'
        },
        {
            name: 'id'
        },
        {
            name: 'indicator'
        },
        {
            name: 'name'
        },
        {
            name: 'plugin'
        },
        {
            name: 'units'
        }
    ]
});