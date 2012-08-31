Ext.define('PaaSMonitor.controller.MoniteesController', {
	extend : 'Ext.app.Controller',

	views : ['Monitee.AddWizard'],

	refs : [{
		ref : 'addWizard',
		selector : 'addwizard',
		xtype : 'addwizard'
	}, {
		ref : 'phymForm',
		selector : 'addwizard addphym form'
	}, {
		ref : 'vimGrid',
		selector : 'addwizard addvim grid'
	}],

	init : function(application) {
		this.control({
			'#save_phym_button' : {
				click : this.savePhym
			},
			'#save_selected_vims_button' : {
				click : this.saveSelectedVims
			}
		});
	},

	savePhym : function(button) {
		var controller = this;
		var form = button.up('form'), values = form.getValues(), wizard = this.getAddWizard();
		var loadMask = new Ext.LoadMask(wizard, {
			msg : "Loading...Please wait..."
		});
		loadMask.show();
		Ext.Ajax.request({
			url : 'resources/createphym',
			method : 'POST',
			params : {
				ip : values.ip,
				username : values.username,
				password : values.password
			},
			success : function(response) {
				form.getForm().reset();
				var resp = Ext.decode(response.responseText);
				var data = resp.data;
				// var reader = Ext.create('Ext.data.JsonReader');
				var name = resp.message;
				var grid = controller.getVimGrid();
				var store = grid.store;
				grid.setTitle('Available Virtual Machines on Phym ' + name);
				store.loadData(data);
				wizard.setTitle('请从下面列表中选择想要监测的虚拟机');
				wizard.layout.setActiveItem('addvim');
				loadMask.hide();
			},
			failure : function(response) {
				loadMask.hide();
				var resp = Ext.decode(response.responseText);
				Ext.MessageBox.alert('错误', resp.message);
			}
		});

	},

	saveSelectedVims : function() {
		var grid = this.getVimGrid();
		var wizard = this.getAddWizard();
		var selection = grid.getSelectionModel().getSelection();
		var count = selection.length;
		if (count > 0) {
			var loadMask = new Ext.LoadMask(grid.up('panel'), {
				msg : "Loading"
			});
			loadMask.show();
		}
		var vims = new Array();
		for (var i = 0; i < count; i++) {
			vims.push(selection[i].data);
		}
		Ext.Ajax.request({
			url : 'resources/vim',
			method : 'POST',
			timeout : 180000,
			jsonData : Ext.encode(vims),
			success : function(response) {
				loadMask.hide();
				var resp = Ext.decode(response.responseText);
				var num = resp.data.length;
				var list = '';
				for(var i =0; i< num ; i++){
					list += resp.data[i].name + '&nbsp;';
				}
				wizard.layout.setActiveItem(0);
		 		wizard.up('panel').layout.setActiveItem(0);
				Ext.MessageBox.alert('提示', '成功添加了' + num + '个虚拟机，分别是：' + list);
			},
			failure : function() {
				loadMask.hide();
				wizard.layout.setActiveItem(0);
		 		wizard.up('panel').layout.setActiveItem(0);
				Ext.MessageBox.alert('提示', '出现了不可预料的错误');
			}
		});
	}
});
