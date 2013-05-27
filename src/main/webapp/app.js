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
		Ext.groupId = Ext.util.Cookies.get('_monitor_');				
		//Ext.groupId = 116; 
		if(Ext.groupId == null || Ext.groupId == ""){
			location.href='http://sso.seforge.org/javasso/member/rlogin.do?redirectTo=http://monitor.seforge.org/';
		}	
			
		var navigation = Ext.ComponentQuery.query('navigation')[0];
		var menu = navigation.down('dataview');
		var store = menu.getStore();
		if(Ext.groupId !=1){
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
