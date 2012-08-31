Ext.define('PaaSMonitor.view.ContentPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.contentpanel',
    requires: [
        'PaaSMonitor.view.StartPanel',
        'PaaSMonitor.view.Monitee.AddWizard',
        'PaaSMonitor.view.ModelDef.ModelDefPanel',
        'PaaSMonitor.view.ModelView.ModelViewPanel'
    ],

    border: 0,
    activeItem: 0,
    layout: {
        type: 'card'
    },

    initComponent: function() {
        var me = this;

        Ext.applyIf(me, {
            items: [
                {
                    xtype: 'startpanel',
                    id: 'start-panel'
                },
                {
                    xtype: 'addwizard',
                    id: 'add-monitee-panel'
                },
                {
                    xtype: 'modeldefpanel',
                    id: 'model-def-panel'
                },
                {
                    xtype: 'modelviewpanel',
                    id: 'model-view-panel'
                }
            ]
        });
        me.callParent(arguments);
    }

});