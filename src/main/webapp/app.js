Ext.Loader.setConfig({
	enabled : true
});

Ext.Loader.setPath('Ext.ux', 'lib');

Ext.application({
	models : [
			'Resource', 'ResourcePrototype', 'ResourcePropertyKey', 'ResourcePropertyValue',
			'MetricTemplate', 'Metric', 'HistoryData'
	],
	stores : ['MenuStore', 'Vim', 'MetricTemplateStore', 'MetricStore', 'CustomedMetricStore', 'HistoryDataStore'],
	autoCreateViewport : true,
	name : 'PaaSMonitor',
	controllers : ['MenuController', 'MoniteesController', 'ModelDefController', 'ModelViewController'],

	launch : function() {
		var hideMask = function() {
			Ext.get('loading').remove();
			Ext.fly('loading-mask').animate({
				opacity : 0,
				remove : true
			});
		};

		Ext.defer(hideMask, 200);
	}
});
