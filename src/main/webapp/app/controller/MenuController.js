Ext.define('PaaSMonitor.controller.MenuController', {
    extend: 'Ext.app.Controller',

    views: [
        'Navigation',
        'ContentPanel'
    ],

    refs: [
        {
            ref: 'contentPanel',
            selector: 'contentpanel'
        }
    ],

    init: function(application) {
        this.control({
            'navigation dataview': {
                selectionchange: this.switchView                
            }

        });
    },

    switchView: function(selModel, selected) {
        if(selected.length > 0){
            var index = selected[0].data.id;
            this.getContentPanel().layout.setActiveItem(index);
        }        
    }

});
