function tableApplication(){ 

	var thisObj = this;

	thisObj.actionFunctions = {};

	thisObj.init = function(){
		console.log('INIT TABLE APPLICATION');
		thisObj.setPrimaryEvents();
		thisObj.getTableContent();
	}

	thisObj.setPrimaryEvents = function(){
		

	}

	thisObj.setDetailEvents = function(){

		$('.list-page .action-cell[action-type="function"]').click(function(){
			var actionItem = $(this);
			var functionName = actionItem.attr('function-name');
			thisObj.actionFunctions[functionName](actionItem);
		});

		$('.list-page .detail-actions .action-button[action-type="function"]').click(function(){
			var actionItem = $(this);
			var functionName = actionItem.attr('function-name');
			thisObj.actionFunctions[functionName](actionItem);
		});

	}

	thisObj.actionFunctions['table-auction'] = function(actionItem){
		var auctionID = actionItem.html();
		thisObj.showTableDetail(actionItem);
		thisObj.getTableAuction(auctionID);
	}

	thisObj.actionFunctions['table-item'] = function(actionItem){
		var itemID = actionItem.html();
		thisObj.showTableDetail(actionItem);
		thisObj.getTableItem(itemID);
	}

	thisObj.actionFunctions['table-owner'] = function(actionItem){
		var ownerID = actionItem.html();
		thisObj.showTableDetail(actionItem);
		thisObj.getTableOwner(ownerID);
	}

	thisObj.actionFunctions['auction-open'] = function(actionItem){
		var auctionID = actionItem.attr('auction-id');
		thisObj.showTableDetail(actionItem);
		thisObj.openTableAuction(auctionID);
	}

	thisObj.actionFunctions['detail-close'] = function(actionItem){
		thisObj.hideTableDetail();
	}


	thisObj.showTableDetail = function(actionItem){
		$('.table-detail').removeClass('active');
		var actionDetail = actionItem.parents('.table-row').next().addClass('active');
	}

	thisObj.hideTableDetail = function(actionItem){
		$('.table-detail').removeClass('active');
	}


	thisObj.getTableAuction = function(auctionID){

		console.log('AUCTION ID: ' + auctionID);

		thisObj.populateTableDetails();

	}

	thisObj.getTableItem = function(auctionID){

		console.log('ITEM ID: ' + auctionID);

		thisObj.populateTableDetails();

	}

	thisObj.getTableOwner = function(auctionID){

		console.log('OWNER ID: ' + auctionID);

		thisObj.populateTableDetails();

	}

	thisObj.openTableAuction = function(auctionID){

		console.log('AUCTION ID: ' + auctionID);

		//MAKE API CALL HERE TO OPEN AUCTION BASED ON "auctionID" VARIABLE

	}


	thisObj.populateDetailItem = function(detailLabel,detailContent){

		console.log('DETAIL BODY: ' + $('.table-detail.active .detail-body').attr('class'));

		var masterHTML = '<div class="detail-item"><div class="item-label">'+detailLabel+'</div><div class="item-content">'+detailContent+'</div></div>';

		$('.table-detail.active .detail-body').append(masterHTML);

	}



	thisObj.populateTableDetails = function(){

		$('.detail-body').html('');

		//PARSE DATA RETURNED FROM API
		//USE "populateDetailItem" function above to add data to DOM

		//START EXAMPLE CODE
		//REPLACE THIS WITH DATA PARSER WITH MULTIPLE "populateDetailItem" CALLS FOR EACH INDIVIDUAL FIELD
		//populateDetailItem(DATA LABEL, DATA CONTENT)
		thisObj.populateDetailItem('Item ID','001');

		//END EXAMPLE CODE

	}

	thisObj.getTableContent = function(){

		var loadedTable = $('body').attr('name');

		switch (loadedTable){
			case 'list-auctions':
				thisObj.getAuctions();
				break;
		}
	}

	thisObj.populateTableRow = function(auctionID, itemID, ownerID, description, index){

		var indexInt = parseInt(index);
		var oddClass = ' even';
		if(indexInt%2 == 0) {
			oddClass = ' odd';
		}

		var masterHTML = '<tr class="table-row'+oddClass+'"><td class="table-cell action-cell" action-type="function" function-name="table-auction">'+auctionID+'</td><td class="table-cell action-cell" action-type="function" function-name="table-item">'+itemID+'</td><td class="table-cell action-cell" action-type="function" function-name="table-owner">'+ownerID+'</td><td class="table-cell">'+description+'</td><td class="table-cell action-cell button-cell" action-type="function" function-name="auction-open" auction-id="'+auctionID+'">Open Auction</td></tr><tr class="table-detail odd"><td class="detail-container" colspan="5"><div class="detail-header"><div class="detail-actions"><div class="action-button" function-name="detail-close" action-type="function"><div class="button-label">Close</div></div></div></div><div class="detail-content"><div class="detail-body"></div></div><div class="detail-footer"></div></td></tr>';

		$('.table-body').append(masterHTML)

	}

	
	thisObj.getAuctions = function(){

		//MAKE API CALL TO GET AUCTION LIST HERE
		//RETURN API DATA TO "populateTable" function below.
		thisObj.populateTable({});

	}

	thisObj.populateTable = function(data){

		//PARSE DATA RETURNED FROM API
		//USE "populateTableRow" function above to add data to DOM

		//START EXAMPLE CODE
		//REPLACE THIS WITH DATA PARSER WITH MULTIPLE "populateTableRow" CALLS FOR EACH INDIVIDUAL FIELD
		//populateTableRow(AUCTION ID, ITEM ID, OWNER ID, DESCRIPTION, INDEX)
		thisObj.populateTableRow('1111','001','200','1969 Ford Mustang Boss 429 Fastback',0);
		thisObj.populateTableRow('1111','002','200','1967 Chevy Camero SS',1);
		//END EXAMPLE CODE 



		//LEAVE THIS LINE AFTER DATA PARSING CODE HAS CALLED ALL "populateTableRow" FUNCTIONS
		thisObj.setDetailEvents();

	}




	
	



}





























