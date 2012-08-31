Ext.define('PaaSMonitor.view.ModelDef.ModelDefPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.modeldefpanel',

    height: 250,
    width: 400,
    layout: {
        type: 'border'
    },
    title: 'Define Model',

    initComponent: function() {
        var me = this;

        Ext.applyIf(me, {
            items: [
                {
                    xtype: 'panel',
                    contentEl: 'modeldef_toolbar_container',
                    height: 50,
                    title: 'Toolbar',
                    region: 'north'
                },
                {
                    xtype: 'panel',
                    contentEl: 'modeldef_sidebar_container',
                    width: 60,
                    title: 'Monitee',
                    region: 'west'
                },
                {
                    xtype: 'panel',
                    contentEl: 'modeldef_graph_container',
                    title: 'Diagram',
                    region: 'center'
                },
                {
                    xtype: 'panel',
                    contentEl: 'modeldef_status_container',
                    height: 30,
                    region: 'south'
                },
                {
                    xtype: 'panel',
                    contentEl: 'modeldef_outline_container',
                    width: 150,
                    title: 'Outline',
                    region: 'east'
                }
            ]
        });

        me.callParent(arguments);
    }

});