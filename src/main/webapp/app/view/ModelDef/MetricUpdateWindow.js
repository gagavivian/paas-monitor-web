Ext.define('PaaSMonitor.view.ModelDef.MetricUpdateWindow', {
	extend : 'Ext.window.Window',
	alias : 'widget.templatewindow',

	requires : ['PaaSMonitor.store.MetricStore'],

	id : 'MetricUpdateWindow',

	layout : 'fit',
	height : 250,
	width : 400,
	title : '显示该资源的所有可用监测参数',

	closeAction : 'hide',

	//除窗口外背景全部变为暗色，然后其他区域不能操作
	modal : true,

	initComponent : function() {
		var me = this;

		//在此处添加需要在window中使用的组件，如grid

		var checkColumn = new Ext.ux.CheckColumn({
			header : 'Enabled',
			dataIndex : 'enabled',
			id : 'check',
			width : 55
		});

		var grid = Ext.create('Ext.grid.Panel', {
			store : 'MetricStore',
			columns : [checkColumn, {
				header : '名称',
				dataIndex : 'templateName'
			}, {
				header : '间隔/min',
				dataIndex : 'interval',
				format : '0,000',
				flex : 1,
				editor : {
					xtype : 'numberfield',
					allowblank : false
				},
				renderer : function(value, cellmeta, record, rowIndex, columnIndex, store) {
					var readable = value /(1000*60);
					return readable;
				}
			}, {
				header : '单位',
				dataIndex : 'templateUnits'
			}],

			height : 200,
			width : 400,

			plugins : [Ext.create('Ext.grid.plugin.CellEditing', {
				clicksToEdit : 1
			})],

			dockedItems : [{
				xtype : 'pagingtoolbar',
				store : 'MetricStore',
				dock : 'bottom',
				displayInfo : true
			}]
		});

		me.items = [grid];

		var _store = grid.getStore();
		//var _selModel = grid.getSelectionModel();

		var ok = Ext.create('Ext.Button', {
			id : 'update_metrics_button',
			text : '生成Metric',
		});

		var cancel = Ext.create('Ext.Button', {
			text : '取消',
			handler : function() {
				me.hide();
			}
		});

		me.buttons = [ok, cancel];

		me.callParent(arguments);
	}
}); 