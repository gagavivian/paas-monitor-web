Ext.define('PaaSMonitor.view.ModelDef.MetricTemplateWindow', {
    extend: 'Ext.window.Window',
    alias: 'widget.templatewindow',
   
    height: 250,
    width: 400,
    title: '显示该资源的所有可用监测参数',
    
    closeAction: 'hide',
    
    //除窗口外背景全部变为暗色，然后其他区域不能操作
    modal: true,

    initComponent: function() {
        var me = this;


		//在此处添加需要在window中使用的组件，如grid
        

        me.callParent(arguments);
    }

});