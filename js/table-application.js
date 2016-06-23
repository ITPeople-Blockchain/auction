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

	thisObj.setTableEvents = function(){

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

	thisObj.setDetailEvents = function(){

		$('.list-page .form-button').click(function(){
			console.log('FORM BUTTON SUBMIT');
			var actionItem = $(this);
			formApp.submitForm(actionItem);
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
		thisObj.openTableAuction(auctionID);
	}

	thisObj.actionFunctions['bid-open'] = function(actionItem){
		var itemID = actionItem.attr('item-id');
		thisObj.showTableDetail(actionItem);
		thisObj.openTableBid(itemID);
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

		//MAKE API CALL TO GET AUCTION DETAILS
		//RETURN API DATA TO "populateTableDetails" FUNCTION BELOW.
		//REMOVE DEBUG LINE BELOW
		thisObj.populateTableDetails(auctionID, "GetAuctionRequest");

	}

	thisObj.getTableItem = function(itemID){

		console.log('ITEM ID: ' + itemID);

		//MAKE API CALL TO GET ITEM DETAILS
		//RETURN API DATA TO "populateTableDetails" FUNCTION BELOW.
		//REMOVE DEBUG LINE BELOW
		thisObj.populateTableDetails(itemID, "GetItem");

	}
  //TODO: Remove if not used
	thisObj.getTableOwner = function(ownerID){

		console.log('OWNER ID: ' + ownerID);

		//MAKE API CALL TO GET OWNER DETAILS
		//RETURN API DATA TO "populateTableDetails" FUNCTION BELOW.
		//REMOVE DEBUG LINE BELOW
		thisObj.populateTableDetails(ownerID, "GetUser");

	}

	thisObj.openTableAuction = function(auctionID){

		console.log('AUCTION ID: ' + auctionID);

		//TODO: OpenAuctionForBids "Args":["1111", "OPENAUC", "1"]}'
		var args = [];
		args.push(auctionID);
		args.push("OPENAUC");
		args.push("5");
		var payload = constructPayload("invoke", "OpenAuctionForBids", args)
		RestCall(payload, "invoke");
		//MAKE API CALL HERE TO OPEN AUCTION BASED ON "auctionID" VARIABLE

	}

	thisObj.openTableBid = function(multiIds){

		console.log('Multiple IDS: ' + multiIds);
		//alert(multiIds)
		//TODO: Split the value to AuctionID+ ItemID + Current Ownerra ID : 7967-1000-200
		//MAKE API CALL HERE TO OPEN BID FORM BASED ON "itemID" VARIABLE
		//RETURN API DATA TO "populateBiddingForm" FUNCTION BELOW.
		//REMOVE DEBUG LINE BELOW
		thisObj.populateBiddingForm(multiIds);

	}


	thisObj.populateDetailItem = function(detailLabel,detailContent){

		console.log('DETAIL BODY: ' + $('.table-detail.active .detail-body').attr('class'));

		var masterHTML = '<div class="detail-item"><div class="item-label">'+detailLabel+'</div><div class="item-content">'+detailContent+'</div></div>';

		$('.table-detail.active .detail-body').append(masterHTML);

	}

	thisObj.populateSubTable = function(res) {
		$('.detail-body').html('');
		console.log(res);
		var obj = JSON.parse(res)
		for (prop in obj){
			if (prop == 'RecType' || prop == 'ItemImage'){
				continue;
			}
			thisObj.populateDetailItem(prop,obj[prop]);
		}
	}

	thisObj.populateTableDetails = function(id, functionName){

		//$('.detail-body').html('');

		//PARSE DATA RETURNED FROM API
		//USE "populateDetailItem" FUNCTION ABOVE TO ADD DATA TO DOM

		//START EXAMPLE CODE
		//REPLACE THIS WITH DATA PARSER WITH MULTIPLE "populateDetailItem" CALLS FOR EACH INDIVIDUAL FIELD
		//populateDetailItem(DATA LABEL, DATA CONTENT)
		/*thisObj.populateDetailItem('Item ID','001');*/
		var payload = constructPayload("query", functionName, [id])
		RestCall(payload, "query",functionName);
		//END EXAMPLE CODE

	}




	thisObj.getTableContent = function(){

		var loadedTable = $('body').attr('name');

		switch (loadedTable){
			case 'list-auctions':
				thisObj.getAuctions();
				break;
			case 'list-bidding':
				thisObj.getBidding();
				break;
		}
	}

	thisObj.populateTableRow = function(auctionID, itemID, ownerID, index){

		var indexInt = parseInt(index);
		var oddClass = ' even';
		if(indexInt%2 == 0) {
			oddClass = ' odd';
		}

		/*var masterHTML = '<tr class="table-row'+oddClass+'"><td class="table-cell action-cell" action-type="function" function-name="table-auction">'+auctionID+'</td><td class="table-cell action-cell" action-type="function" function-name="table-item">'+itemID+'</td><td class="table-cell action-cell" action-type="function" function-name="table-owner">'+ownerID+'</td><td class="table-cell">'+description+'</td><td class="table-cell action-cell button-cell" action-type="function" function-name="auction-open" auction-id="'+auctionID+'">Open Auction</td></tr><tr class="table-detail odd"><td class="detail-container" colspan="5"><div class="detail-header"><div class="detail-actions"><div class="action-button" function-name="detail-close" action-type="function"><div class="button-label">Close</div></div></div></div><div class="detail-content"><div class="detail-body"></div></div><div class="detail-footer"></div></td></tr>';*/
	    var masterHTML = '<tr class="table-row'+oddClass+'"><td class="table-cell action-cell" action-type="function" function-name="table-auction">'+auctionID+'</td><td class="table-cell action-cell" action-type="function" function-name="table-item">'+itemID+'</td><td class="table-cell action-cell" action-type="function" function-name="table-owner">'+ownerID+'</td><td class="table-cell action-cell button-cell" action-type="function" function-name="auction-open" auction-id="'+auctionID+'">Open Auction</td></tr><tr class="table-detail odd"><td class="detail-container" colspan="5"><div class="detail-header"><div class="detail-actions"><div class="action-button" function-name="detail-close" action-type="function"><div class="button-label">Close</div></div></div></div><div class="detail-content"><div class="detail-body"></div></div><div class="detail-footer"></div></td></tr>';

		$('.table-body').append(masterHTML)

	}


	thisObj.getAuctions = function(){

		//MAKE API CALL TO GET AUCTION LIST HERE
		//RETURN API DATA TO "populateTable" FUNCTION BELOW.
		//REMOVE DEBUG LINE BELOW
		//call the below when response received
		var functionName = "GetListOfItemsOnAuc";
		var payload = constructPayload("query",functionName , ["2016"])
		RestCall(payload, "query", functionName);
		//thisObj.populateTable({});
	}


	thisObj.populateTable = function(data){
		//console.log(data);
		var obj = JSON.parse(data)
		var count = 0;
		for (var property in obj) {
			//console.log(obj[count]);
			//thisObj.populateTableRow('1111','001','200',0);
			thisObj.populateTableRow(obj[count].AuctionID, obj[count].ItemID,obj[count].SellerID , count);
			count++;
		}

		//PARSE DATA RETURNED FROM API
		//USE "populateTableRow" FUNCTION ABOVE TO ADD DATA TO DOM

		//START EXAMPLE CODE
		//REPLACE THIS WITH DATA PARSER WITH MULTIPLE "populateTableRow" CALLS FOR EACH INDIVIDUAL FIELD
		//populateTableRow(AUCTION ID, ITEM ID, OWNER ID, DESCRIPTION, INDEX)
		//thisObj.populateTableRow('1111','001','200','1969 Ford Mustang Boss 429 Fastback',0);
		//thisObj.populateTableRow('1111','002','200','1967 Chevy Camero SS',1);
		//thisObj.populateTableRow('1111','001','200',0);
		//thisObj.populateTableRow('1111','002','200',1);
		//END EXAMPLE CODE

		//LEAVE THIS LINE AFTER DATA PARSING CODE HAS CALLED ALL "populateTableRow" FUNCTIONS
		//thisObj.setDetailEvents();
		thisObj.setTableEvents();
		thisObj.setDetailEvents();

	}





	thisObj.populateBiddingRow = function(auctionID, itemID, ownerID, description, index){

		var indexInt = parseInt(index);
		var oddClass = ' even';
		if(indexInt%2 == 0) {
			oddClass = ' odd';
		}
		var masterHTML = '<tr class="table-row'+oddClass+'"><td class="table-cell">'+auctionID+'</td><td class="table-cell">'+itemID+'</td><td class="table-cell">'+ownerID+'</td><td class="table-cell action-cell button-cell" action-type="function" function-name="bid-open" item-id="'+auctionID+"-"+itemID+"-"+ownerID+'">Bid Now</td></tr><tr class="table-detail odd"><td class="detail-container" colspan="5"><div class="detail-header"><div class="detail-actions"><div class="action-button" function-name="detail-close" action-type="function"><div class="button-label">Close</div></div></div></div><div class="detail-content"><div class="detail-body"></div></div><div class="detail-footer"></div></td></tr>';

		$('.table-body').append(masterHTML)

	}


	thisObj.getBidding = function(){

		//MAKE API CALL TO GET AUCTION LIST HERE
		//RETURN API DATA TO "populateBidding" FUNCTION BELOW.
		//REMOVE DEBUG LINE BELOW
		var functionName = "GetListOfOpenAucs";
		var payload = constructPayload("query",functionName , ["2016"])
		RestCall(payload, "query", functionName);
		//thisObj.populateBidding({});

	}


	thisObj.populateBidding = function(data){

		//PARSE DATA RETURNED FROM API
		//USE "populateBiddingRow" FUNCTION ABOVE TO ADD DATA TO DOM

		//START EXAMPLE CODE
		//REPLACE THIS WITH DATA PARSER WITH MULTIPLE "populateBiddingRow" CALLS FOR EACH INDIVIDUAL FIELD
		//populateBiddingRow(AUCTION ID, ITEM ID, OWNER ID, INDEX)
		//thisObj.populateBiddingRow('1111','001','200',0);
		//END EXAMPLE CODE
		var obj = JSON.parse(data)
		var count = 0;
		for (var property in obj) {
			//console.log(obj[count]);
			//thisObj.populateTableRow('1111','001','200',0);
			//TODO: Ratnakar :What user should we use AuctionHouseID ?
			thisObj.populateBiddingRow(obj[count].AuctionID, obj[count].ItemID,obj[count].AuctionHouseID , count);
			count++;
		}
		//LEAVE THIS LINE AFTER DATA PARSING CODE HAS CALLED ALL "populateBiddingRow" FUNCTIONS
		thisObj.setTableEvents();
    thisObj.setDetailEvents();
	}

	thisObj.auctionID = '';

	thisObj.populateBiddingForm = function(data){
    //TODO: Split the value to AuctionID+ ItemID + Current Ownerra ID : 7967-1000-200
		var res = data.split("-");
		//LEAVE THIS CODE TO ADD BID FORM TO TABLE DROP DOWN
		//var masterHTML = '<div class="form-container"><div class="form-header"><div class="form-title">Bid on Item</div><div class="form-messages"><div class="form-message success">Bid submitted successfully</div><div class="form-message error">Bid submission failed</div></div></div><div class="form-content"><div class="form-body"><div class="body-column column-1 half"><div class="form-item"><div class="item-label">Auction ID</div><div class="item-content"><div class="form-input"><input name="bid_auction" id="bid_auction" type="text" value="" tabindex="1"></div></div></div><div class="form-item"><div class="item-label">Item ID</div><div class="item-content"><div class="form-input"><input name="bid_item" id="bid_item" type="text" value="" tabindex="3"></div></div></div><div class="form-item"><div class="item-label">Current Owner ID</div><div class="item-content"><div class="form-input"><input name="bid_owner" id="bid_owner" type="text" value="" tabindex="5"></div></div></div><div class="form-item"><div class="item-label">Bid Time</div><div class="item-content"><div class="form-input"><input name="bid_time" id="bid_time" type="text" value="" tabindex="7"></div></div></div></div><div class="body-column column-2 half"><div class="form-item"><div class="item-label">Bid ID</div><div class="item-content"><div class="form-input"><input name="bid_id" id="bid_id" type="text" value="" tabindex="2"></div></div></div><div class="form-item"><div class="item-label">Buyer ID</div><div class="item-content"><div class="form-input"><input name="bid_buyer" id="bid_buyer" type="text" value="" tabindex="4"></div></div></div><div class="form-item"><div class="item-label">Bid Price</div><div class="item-content"><div class="form-input"><input name="bid_price" id="bid_price" type="text" value="" tabindex="6"></div></div></div></div></div></div><div class="form-footer"><div class="form-specs"></div><div class="form-button" tabindex="8"><div class="button-label">Place Bid</div></div></div></div>';
		//TODO: Its a dirty fix, change this
		var masterHTML = '<div class="form-container"><div class="form-header"><div class="form-title">Bid on Item</div><div class="form-messages"><div class="form-message success">Bid submitted successfully</div><div class="form-message error">Bid submission failed</div></div></div><div class="form-content"><div class="form-body"><div class="body-column column-1 half"><div class="form-item"><div class="item-label">Buyer ID</div><div class="item-content"><div class="form-input"><input name="bid_buyer" id="bid_buyer" type="text" value="" tabindex="1"></div></div></div></div><div class="body-column column-2 half"><div class="form-item"><div class="item-label">Bid Price</div><div class="item-content"><div class="form-input"><input name="bid_price" id="bid_price" type="text" value="" tabindex="2"><input style="display:none;"name="form_field_values" id="form_field_values" type="text" value="'+data+'" tabindex="3"></div></div></div></div></div></div><div class="form-footer"><div class="form-specs"></div><div class="form-button" tabindex="3"><div class="button-label" id="submit_bid_button">Place Bid</div></div></div></div>';
		$('.detail-body').html(masterHTML);
		thisObj.auctionID = res[0]
		//PARSE DATA RETURNED FROM API
		//USE "populateDetailItem" FUNCTION ABOVE TO ADD DATA TO DOM

		//START EXAMPLE CODE
		//REPLACE THIS WITH DATA PARSER WITH MULTIPLE "populateFormField" CALLS FOR EACH INDIVIDUAL FIELD
		//populateFormField(DATA LABEL, DATA CONTENT)
		/*formApp.populateFormField('bid_auction', res[0]);
		formApp.populateFormField('bid_price','120');*/

		//END EXAMPLE CODE


		//LEAVE THE CODE BELOW TO GET CURRENT BIDS
		//ADJUST THE INTERVAL TO UPDATE THE CURRENT BIDS BELOW
		//CURRENTLY SET TO 10 SECONDS
		var bidInterval = 10000;
		var updateBids = setInterval(function(){
			//Ratnakar
			//TODO: Make a rest call here
			if (thisObj.auctionID){
				console.log(thisObj.auctionID);
				var method = "query";
				var args = [thisObj.auctionID];
				//args.push (key);
				payload = constructPayload(method, "GetLastBid", args);
				RestCall(payload, method, "GetLastBid");
				payload = constructPayload(method, "GetHighestBid", args);
				RestCall(payload, method, "GetHighestBid");
			}
			//thisObj.getCurrentBids();
		},bidInterval);

		//LEAVE THIS LINE AFTER DATA PARSING CODE HAS CALLED ALL "populateFormField" FUNCTIONS
		thisObj.setDetailEvents();
	}

	thisObj.getCurrentBids = function(){

		var itemID = $('.table-detail.active').prev().attr('item-id');
		console.log('GET CURRENT BIDS ITEM ID: ' + itemID);

		//MAKE API CALL USING "itemID" VARIABLE HERE.
		//RETURN API DATA TO "populateCurrentBids" FUNCTION IN FORM-APPLICATION.JS.
		//REMOVE DEBUG LINE OF CODE BELOW
		formApp.populateCurrentBids({});

	}
	/*thisObj.populateFormSpec = function(specName,specData){
	$('.spec-item[name="'+specName+'"] .spec-content').html(specData);
  }
  thisObj.populateHeighestBid = function(data){
	console.log('populateHeighestBid');
	thisObj.populateFormSpec('Last Bid','$67,890');
  }
  thisObj.populateLastBid = function(data){
	console.log('populateLastBid');
	thisObj.populateFormSpec('Last Bid','$67,890');
}*/
}

RestCall = function (payload, method, functionName){
	console.log(JSON.stringify(payload));
	$.ajax({
	    url : mainApp.URL,//"http://localhost:5000/chaincode",
	    type: "POST",
	    data : JSON.stringify(payload),
	    success: function(data, textStatus, jqXHR)
	    {
		//TODO: How to handle the limitation in chaincode REST response when container creation failed ?
		if (method == "deploy") {
			localStorage.isDeploySuccess = true;
		}
		//data - response from server
		if (data["error"] && data["error"].message) {
			if (method == "query") {
				console.log ("Query is failed !! <br/><b>Error:</b> "+data["error"].message)
			}
			return;
		} else if (data["result"] && data["result"].message){
			var res = data["result"].message

			console.log("Results for "+functionName+" "+method+" is "+res);
			if (method == "query"){
 				switch (functionName){
					case "GetAuctionRequest":
					case "GetItem":
					case "GetUser":
						tableApp.populateSubTable(res);
						break;
					case "GetListOfItemsOnAuc":
						tableApp.populateTable(res);
						break;
					case "GetListOfOpenAucs":
						tableApp.populateBidding(res);
						break;
					case "GetHighestBid":
					  console.log("GetHighestBid")
						formApp.populateHeighestBid(res);
						break;
					case "GetLastBid":
					  console.log("GetLastBid")
						formApp.populateLastBid(res);
						break;
				}
			} else if (method == "invoke"){
				console.log("Open Auction is successful !")
			}else {
				console.log("Error : Invalid request")
			}
		} else {
			console.log("Error : Check chaincode logs for more details")
			showSuccsessFailureMessage(false);
		}
	    },
	    error: function (jqXHR, textStatus, errorThrown)
	    {
		showSuccsessFailureMessage(false);
		console.log("Failure :"+textStatus);
	    }
	});
}
