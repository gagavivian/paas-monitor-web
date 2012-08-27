Ext.define('PaaSMonitor.view.ModelView.MetricWindow', {
    extend: 'Ext.window.Window',
    alias: 'widget.showmetric',
   
    height: 250,
    width: 400,
    title: '显示该资源的监测数据',
    
    closeAction: 'hide',
    
    //除窗口外背景全部变为暗色，然后其他区域不能操作
    modal: true,

    initComponent: function() {
        var me = this;

        // Ext.applyIf(me, {
            // items: [
                // {
                    // xtype: 'moniteephymform'
                // },
                // {
                    // xtype: 'moniteevimform'
                // }
            // ]
        // });

        me.callParent(arguments);
    }

});