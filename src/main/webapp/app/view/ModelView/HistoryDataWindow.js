Ext.define('PaaSMonitor.view.ModelView.HistoryDataWindow', {
	extend : 'Ext.window.Window',
	alias : 'widget.showhistorydata',

	requires : ['PaaSMonitor.store.HistoryDataStore'],

	layout : 'fit',
	height : 350,
	width : 700,
	title : '显示该资源的历史监测数据',

	closeAction : 'hide',

	//除窗口外背景全部变为暗色，然后其他区域不能操作
	modal : true,

	initComponent : function() {
		var me = this;

		//在此处添加需要在window中使用的组件，如grid
		var chart = Ext.create('Ext.chart.Chart',{			
				store : 'HistoryDataStore',
				axes : [{
					type : 'Numeric',
					position : 'left',
					fields : ['value'],
					title : '监测值',					
					grid : {
						odd : {
							opacity : 1,
							fill : '#FFFF99',
							stroke : '#FF3300',
							'stroke-width' : 0.5
						},
						even : {
							opacity : 0,
							stroke : '#6600CC',
							'stroke-width' : 0.5
						}
					}
				}, {
					type : 'Time',
					position : 'bottom',
					fields : ['timestamp'],
					grid : true,
					title : '时间',
					dateFormat : 'ga'					
				}],
				series : [{
					type : 'line',
					axis : 'left',
					xField : 'timestamp',
					yField : 'value',					
					tips : {
						trackMouse : true,
						width : 110,
						height : 25,
						renderer : function(storeItem, item) {
							this.setTitle(storeItem.get('value'));
						}
					},
				}]			
		});		

		var chartPanel = Ext.create('Ext.panel.Panel', {
			layout : 'fit',
			items : [chart]
		});

		me.items = [chartPanel];

		var close = Ext.create('Ext.Button', {
			text : '关闭窗口',
			handler : function() {
				me.hide();
			}
		});

		me.buttons = [close];

		me.callParent(arguments);
	}
}); 