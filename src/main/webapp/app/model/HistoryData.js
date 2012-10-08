Ext.define('PaaSMonitor.model.HistoryData', {
    extend: 'Ext.data.Model',
    
    //requires: ['PasSMonitor.model.MetricTemplate'],
    
    fields: [
        {name: 'timestamp'},
        {name: 'value'}
    ]
});