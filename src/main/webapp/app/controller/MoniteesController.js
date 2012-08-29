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
			failure : function(r, operation) {
				loadMask.hide();				
				Ext.MessageBox.alert('错误', '无法添加物理机');				
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
		var successNum = 0, failNum = 0, added = 0, requestCounter = 0;
		var succeed = function() {
			successNum++;
			added++;
			if (added == count) {
				loadMask.hide();
				Ext.MessageBox.alert('提示', '共添加了' + count + '个虚拟机，成功：' + successNum + '个，失败：' + failNum + '个');
				wizard.layout.setActiveItem(0);
				wizard.up('panel').layout.setActiveItem(0);
			}
		};
		var fail = function() {
			failNum++;
			added++;
			if (added == count) {
				loadMask.hide();
				Ext.MessageBox.alert('提示', '共添加了' + count + '个虚拟机，成功：' + successNum + '个，失败：' + failNum + '个');
				wizard.layout.setActiveItem(0);
				wizard.up('panel').layout.setActiveItem(0);
			}
		};
		for (var i = 0; i < count; i++) {
			requestCounter++;
			Ext.Ajax.request({
				url : 'resources/vim',
				method : 'POST',
				jsonData : Ext.encode(selection[i].data),
				success : succeed,
				failure : fail
			});
		}
	}
});
