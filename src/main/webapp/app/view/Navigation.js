Ext.define('PaaSMonitor.view.Navigation', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.navigation',

    width: 150,
    layout: {
        align: 'stretch',
        type: 'vbox'
    },
    collapsible: true,
    title: 'Navigation',

    initComponent: function() {
        var me = this;

        Ext.applyIf(me, {
            items: [
                {
                    xtype: 'dataview',
                    cls: 'menu-list',
                    id: 'menu-view',
                    tpl: [
                        '<tpl for="."><div class="menu-list-item"><span class="menu-icon"><img src="resources/icons/menu/{icon}" /></span>{name}</div></tpl>'
                    ],
                    itemSelector: '.menu-list-item',
                    overItemCls: 'menu-list-item-hover ',
                    singleSelect: true,
                    store: 'MenuStore',
                    trackOver: true,
                    flex: 1
                }
            ]
        });

        me.callParent(arguments);
    }

});