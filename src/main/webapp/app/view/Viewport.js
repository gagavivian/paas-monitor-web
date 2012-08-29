Ext.define('PaaSMonitor.view.Viewport', {
    extend: 'Ext.container.Viewport',
    requires: [
        'PaaSMonitor.view.Navigation',
        'PaaSMonitor.view.ContentPanel'
    ],
    renderTo: Ext.getBody(),

    layout: {
        type: 'border'
    },

    initComponent: function() {
        var me = this;

        Ext.applyIf(me, {
            items: [
                {
                    xtype: 'navigation',
                    id: 'navigation',
                    region: 'west'
                },
                {
                    xtype: 'contentpanel',
                    id: 'content',
                    region: 'center'
                }
            ]
        });

        me.callParent(arguments);
    }

});