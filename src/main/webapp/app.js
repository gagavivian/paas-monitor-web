Ext.Loader.setConfig({
    enabled: true
});

Ext.application({
    models: [
        'Resource',
        'ResourcePrototype',
        'ResourcePropertyKey',
        'ResourcePropertyValue'
    ],
    stores: [
        'MenuStore',           
        'Vim'
    ],
    autoCreateViewport: true,
    name: 'PaaSMonitor',
    controllers: [
        'MenuController',
        'MoniteesController',
        'ModelController'
    ],

    launch: function() {
        var hideMask = function () {
            Ext.get('loading').remove();
            Ext.fly('loading-mask').animate({
                opacity:0,
                remove:true                
            });
        };

        Ext.defer(hideMask, 200);
    }

});