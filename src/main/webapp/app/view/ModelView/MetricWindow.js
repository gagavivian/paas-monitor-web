Ext.define('PaaSMonitor.view.ModelView.MetricWindow', {
	extend : 'Ext.window.Window',
	alias : 'widget.showmetric',

	requires : ['PaaSMonitor.store.CustomedMetricStore'],

	layout : 'fit',
	height : 250,
	width : 400,
	title : '显示该资源的监测数据',

	closeAction : 'hide',

	//除窗口外背景全部变为暗色，然后其他区域不能操作
	modal : false,

	initComponent : function() {
		var me = this;

		//在此处添加需要在window中使用的组件，如grid

		var grid = Ext.create('Ext.grid.Panel', {
			id : 'metricviewgrid',
			store : 'CustomedMetricStore',
			columns : [{
				header : '名称',
				dataIndex : 'templateName'
			}, {
				header : '间隔/min',
				dataIndex : 'interval',
				format : '0,000',
				flex : 1,
				renderer : function(value, cellmeta, record, rowIndex, columnIndex, store) {
					var readable = value /(1000*60);
					return readable;
				}
			}, {
				header : '单位',
				dataIndex : 'templateUnits'
			}, {
				header : '显示监测历史数据',
				xtype : 'actioncolumn',
				id : 'showdata',
				items : [{

					icon : 'images/showchart.png',
					alertText : '显示监测历史数据',
					tooltip : '点击显示监测历史数据'
				}]
			}],
			selType : 'rowmodel',
			height : 200,
			width : 400,
			dockedItems : [{
				xtype : 'pagingtoolbar',
				store : 'CustomedMetricStore',
				dock : 'bottom',
				displayInfo : true
			}],
		});

		me.items = [grid];

		var close = Ext.create('Ext.Button', {
			text : '关闭',
			handler : function() {
				me.hide();
			}
		});

		me.buttons = [close];

		me.callParent(arguments);
	}
}); 