Ext.define('PaaSMonitor.view.ModelView.ModelViewPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.modelviewpanel',

    layout: {
        type: 'border'
    },

    initComponent: function() {
        var me = this;

        Ext.applyIf(me, {
            items: [
                {
                    xtype: 'panel',
                    contentEl: 'runtimemodel_graph_container',
                    id: 'model_graph_panel',
                    autoScroll: true,
                    title: 'Runtime Model',
                    region: 'center'
                },
                {
                    xtype: 'panel',
                    contentEl: 'runtimemodel_status_container',
                    height: 60,
                    region: 'south'
                },
                {
                    xtype: 'panel',
                    contentEl: 'runtimemodel_outline_container',
                    width: 150,
                    collapsible: true,
                    title: 'Outline',
                    region: 'east'
                },
                {
                    xtype: 'panel',
                    contentEl: 'runtimemodel_toolbar_container',
                    height: 60,
                    collapsible: true,
                    title: 'View Model',
                    region: 'north'
                }
            ]
        });

        me.callParent(arguments);
    }

});