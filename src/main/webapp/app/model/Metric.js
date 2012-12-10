Ext.define('PaaSMonitor.model.Metric', {
    extend: 'Ext.data.Model',
    
    //requires: ['PasSMonitor.model.MetricTemplate'],

    idProperty: 'id',
    
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
        },
        {
        		name: 'templateName',
        		mapping: 'metricTemplate.name'
        },
        {
        		name: 'templateUnits',
        		mapping: 'metricTemplate.units'
        }
    ]
});