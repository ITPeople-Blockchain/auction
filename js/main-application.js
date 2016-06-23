function mainApplication(){ 

	var thisObj = this;

	thisObj.init = function(){
		console.log('INIT MAIN APPLICATION');
		thisObj.setPrimaryEvents();

	}

	thisObj.setPrimaryEvents = function(){

		//MENUS
		$('.header-branding').click(function(){
			thisObj.loadFront();
		});

		$('.header-menu .primary-event').click(function(){
			var actionItem = $(this);
			actionItem.parent().siblings().each(function(index){thisObj.closeMenu($(this))});
			actionItem.parent().toggleClass('active');
		});

		$('.header-menu .action-load-form').click(function(){
			var actionItem = $(this);
			formApp.loadForm(actionItem);
		});

		$('.header-menu .action-load-page').click(function(){
			var actionItem = $(this);
			thisObj.loadPage(actionItem);
		});

		$('.header-menu .action-load-list').click(function(){
			var actionItem = $(this);
			thisObj.loadList(actionItem);
		});

		//MAIN
		$('.site-main').click(function(){
			thisObj.closeMenus();
		});

		//BUTTONS
		$('.action-button[action-type="form"]').click(function(){
			var actionItem = $(this);
			var actionParent = actionItem.parents('.item');
			var actionId = actionParent.attr('item-id');
			formApp.loadForm(actionItem,'?item-id='+actionId);
		});

		$('.action-button[action-type="detail"]').click(function(){
			var actionItem = $(this);
			var actionParent = actionItem.parents('.item');
			var actionId = actionParent.attr('item-id');
			formApp.loadForm(actionItem,'?item-id='+actionId);
		});

		//FOOTER
		$('.site-footer').click(function(){
			thisObj.closeMenus();
		});

		


	}


	//MENUS

	thisObj.loadFront = function(){
		window.open('index.html',"_self");
	}

	thisObj.closeMenu = function(menuObj){
		menuObj.removeClass('active');
	}

	thisObj.closeMenus = function(){
		$('.header-menu .menu-item').removeClass('active');
	}


	//PAGES

	thisObj.loadPage = function(actionPage,args){
		var pageName = actionPage.attr('page-name');
		var pageArgs = '';
		if(args!=undefined&&args!=null){
			pageArgs = args;
		}
		window.open(pageName+'.html'+pageArgs,"_self");
	}

	//LISTS

	thisObj.loadList = function(actionList,args){
		var listName = actionList.attr('list-name');
		var listArgs = '';
		if(args!=undefined&&args!=null){
			listArgs = args;
		}
		window.open(listName+'.html'+listArgs,"_self");
	}


	

}





























