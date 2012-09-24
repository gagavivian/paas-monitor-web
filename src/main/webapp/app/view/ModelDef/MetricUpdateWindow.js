Ext.define('PaaSMonitor.view.ModelDef.MetricUpdateWindow', {
    extend: 'Ext.window.Window',
    alias: 'widget.templatewindow',
    
    requires: [
               'PaaSMonitor.store.MetricStore'
    ],
    
    id: 'MetricUpdateWindow',
   
    layout: 'fit',
    height: 250,
    width: 400,
    title: '显示该资源的所有可用监测参数',
    
    closeAction: 'hide',
    
    //除窗口外背景全部变为暗色，然后其他区域不能操作
    modal: true,

    initComponent: function() {
        var me = this;
        
        //在此处添加需要在window中使用的组件，如grid  
        
        var grid = Ext.create('Ext.grid.Panel', {
    		store: Ext.data.StoreManager.lookup('MetricStore'),
			columns:[{
				header: '名称',  dataIndex: 'templateName' 
				},{
				header: '间隔/ms', dataIndex: 'interval', 
				format: '0,000',
				flex: 1,
				editor: {
					xtype: 'numberfield',
					allowblank: false
					}
				},{
				header: '单位', dataIndex: 'templateUnits' 
			}],
			selType: 'checkboxmodel',
        	multiSelect: true,
			height: 200,
			width: 400,
			plugins:[
				Ext.create('Ext.grid.plugin.CellEditing', {
					clicksToEdit: 1
				})
			],
			dockedItems: [{
				xtype: 'pagingtoolbar',
				store: Ext.data.StoreManager.lookup('MetricStore'),
				dock: 'bottom',
				displayInfo: true
    		}],
        });
        
        me.items = [grid];
        
        var ok = Ext.create('Ext.Button', {
        	text: '生成Metric',
        	handler: function() {
        		var sm = grid.getSelectionModel();
        		var selectedItems = sm.getSelection();
        		var _templates = Ext.encode(selectedItems);
        		Ext.Ajax.request({
        			url: 'generate_metric',
        			params: {
        				groupId: 1,
        				templates: _templates
        			}, 
        			success: function() {
        				Ext.Msg.alert('成功', '生成Metric成功过！');
        			},
        			failure: function(response) {
        				Ext.Msg.alert('失败', respon.responseText);
        			}
        		});
        	}
        });
        
        var cancel = Ext.create('Ext.Button', {
        	text: '取消', 
        	handler: function() {
        		me.hide();
        	}
        });
        
        me.buttons = [ok, cancel];
        

        me.callParent(arguments);
    }

});