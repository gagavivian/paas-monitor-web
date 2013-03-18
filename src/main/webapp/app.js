Ext.Loader.setConfig({
	enabled : true
});

Ext.Loader.setPath('Ext.ux', 'lib');

Ext.application({
	models : [
			'Resource', 'ResourcePrototype', 'ResourcePropertyKey', 'ResourcePropertyValue',
			'MetricTemplate', 'Metric', 'HistoryData'
	],
	stores : ['MenuStore', 'Vim', 'MetricTemplateStore', 'MetricStore', 'CustomedMetricStore', 'HistoryDataStore', 'ConditionStore', 'EnabledMetricStore'],
	autoCreateViewport : true,
	name : 'PaaSMonitor',
	controllers : ['MenuController', 'MoniteesController', 'ModelDefController', 'ModelViewController'],
	views : ['Navigation'],
	launch : function() {
		Ext.groupId = getRequestParam('groupId');
		var gId = getRequestParam('gId');
		if(Ext.groupId == null || Ext.groupId == ""){
			/*var win;
        	if(!win){
            win = Ext.create('PaaSMonitor.view.Login').show();
        	}*/
        	Ext.groupId = 0;
		}		
		var navigation = Ext.ComponentQuery.query('navigation')[0];
		var menu = navigation.down('dataview');
		var store = menu.getStore();
		if(Ext.groupId !=0){
			store.removeAt(0);
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
