Ext.define('PaaSMonitor.model.MetricModel', {
    extend: 'Ext.data.Model',

    idProperty: 'MetricModel',
    
    fields: [
        {
            name: 'id'
        },
        {
            name: 'interval'
        },
        {
            name: 'enabled'
        },
        {
            name: 'resourcePrototype'
        },
        {
            name: 'groupId'
        },
        {
        		name: 'metricTemplate'
        }
    ]
});