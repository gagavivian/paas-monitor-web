Ext.require(['Ext.Ajax', 'Ext.tip.QuickTipManager', 'Ext.data.Model', 'Ext.data.Store', 'Ext.grid.Panel', 'Ext.panel.Panel']);

Ext.onReady(function() {

	Ext.tip.QuickTipManager.init();

	var resource_id = getRequestParam('id');
	
	var group_store = Ext.create('Ext.data.Store', {
		
		autoLoad: true,
		
		fields: [{
			name: 'id'
		}, {
			name: 'groupOwnerName',
			mapping: 'groupOwner.name'
		}, {
			name: 'groupOwnerEmail',
			mapping: 'groupOwner.email'
		}],
		
		groupField : 'groupOwnerName',
		
		proxy: {
			type: 'ajax',
			url: 'list_subresources?id=' + resource_id,
			reader: {
				type: 'json',
				root: 'data'
			}
		}
		
	});
	
	var group_panel = Ext.create('Ext.grid.Panel', {
	
		title : '报警资源的组信息',
		
		titleAlign: 'center',
	
		store : group_store,
		
		width : 500,
		
		anchorSize : {
			width : 100,
			height : 50
		},
		
		features : {
			ftype : 'grouping',
			groupHeaderTpl: '{name}',
         hideGroupedHeader: true,
         enableGroupingMenu: false
		},
		
		columns : [{
			header : '组管理员',
		}, {
			header : '邮件',
			dataIndex : 'groupOwnerEmail',
			sortable : false
		}, {
			header : '组id',
			dataIndex : 'id',
			sortable : false
		}],
	
		renderTo : Ext.getBody()
	});
	
	var hideMask = function() {
		Ext.get('loading').remove();
		Ext.fly('loading-mask').animate({
			opacity : 0,
			remove : true
		});
	};

	Ext.defer(hideMask, 200);

});
