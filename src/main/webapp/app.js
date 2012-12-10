Ext.Loader.setConfig({
	enabled : true
});

Ext.Loader.setPath('Ext.ux', 'lib');

Ext.application({
	models : [
			'Resource', 'ResourcePrototype', 'ResourcePropertyKey', 'ResourcePropertyValue',
			'MetricTemplate', 'Metric', 'HistoryData'
	],
	stores : ['MenuStore', 'Vim', 'MetricTemplateStore', 'MetricStore', 'CustomedMetricStore', 'HistoryDataStore', 'ConditionStore'],
	autoCreateViewport : true,
	name : 'PaaSMonitor',
	controllers : ['MenuController', 'MoniteesController', 'ModelDefController', 'ModelViewController'],

	launch : function() {
		Ext.groupId = getRequestParam('groupId');
		if(Ext.groupId == null || Ext.groupId == ""){
			/*var win;
        	if(!win){
            win = Ext.create('PaaSMonitor.view.Login').show();
        	}*/
        	Ext.groupId = 1;
		}		
		
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
