Ext.define('PaaSMonitor.model.MetricTemplateModel', {
    extend: 'Ext.data.Model',

    idProperty: 'MetricTemplateModel',
    
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