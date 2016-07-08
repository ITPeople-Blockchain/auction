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

		//STARTS THE AUCTION TIMERS
		//ADJUST THE INTERVAL TO UPDATE THE CURRENT BIDS BELOW
		//CURRENTLY SET TO 5 SECONDS
		var bidInterval = 1000;
		var updateAuctionTimer = setInterval(function(){
			thisObj.UpdateAuctionTimers();
		},bidInterval);
	}

	thisObj.CloseAuctionsPoll = function(){
		var method = "invoke";
		var args = ["2016", "CLAUC"];
		var functionName = "CloseOpenAuctions";
		payload = constructPayload(method, functionName, args);
		RestCall(payload, method, functionName);
	}

	//V2.1
	thisObj.setDetailEvents = function(){

		$('.list-page .form-button').click(function(){
			console.log('FORM BUTTON SUBMIT');
			var actionItem = $(this);
			formApp.submitForm(actionItem);
		});

		$('.list-page .form-button-alt').click(function(){
			console.log('FORM BUTTON ALT SUBMIT');
			var actionItem = $(this);
			formApp.submitAltForm(actionItem);
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

	//V2.0
	thisObj.openTableAuction = function(auctionID){
    thisObj.populateAuctionForm(auctionID);
	}

	//V2.0
	thisObj.finishTableAuction = function(auctionID){

		console.log('AUCTION ID: ' + auctionID);

		//MAKE API CALL HERE TO OPEN AUCTION BASED ON "auctionID" VARIABLE
		//ON SUCCESS CALL "successfulAuctionOpen" FUNCTION BELOW PASSING AUCTION ID.
		//REMOVE DEBUG LINE BELOW
		thisObj.successfulAuctionOpen(auctionID);

	}


	//V2.0
	thisObj.successfulAuctionOpen = function(auctionID){

		console.log('SUCCESS AUCTION ID: ' + auctionID);

		$('tr.table-row[auction-id="'+auctionID+'"]').next().remove();
		$('tr.table-row[auction-id="'+auctionID+'"]').remove();

	}

	thisObj.openTableBid = function(multiIds){

		//TODO: Split the value to AuctionID+ ItemID + Current Ownerra ID : 7967-1000-200
		thisObj.populateBiddingForm(multiIds);

	}


	thisObj.populateDetailItem = function(detailLabel,detailContent){

		//console.log('DETAIL BODY: ' + $('.table-detail.active .detail-body').attr('class'));

		var masterHTML = '<div class="detail-item"><div class="item-label">'+detailLabel+'</div><div class="item-content">'+detailContent+'</div></div>';

		$('.table-detail.active .detail-body').append(masterHTML);

	}

	thisObj.populateSubTable = function(res) {
		$('.detail-body').html('');
		var obj = JSON.parse(res)
		for (prop in obj){
			if (prop == 'RecType' || prop == 'ItemImage'){
				continue;
			} else if (prop === 'ItemPicFN') {
				//TODO: Disable when Auction/User details selected
				thisObj.populateDetailImage('./imgs/'+obj[prop]);

			} else {
				thisObj.populateDetailItem(prop,obj[prop]);
			}
		}
	}

	//V2.0
	thisObj.populateTableDetails = function(id, functionName){

		//$('.detail-body').html('');
		/*thisObj.populateDetailItem('Item ID','001');*/
		var payload = constructPayload("query", functionName, [id])
		RestCall(payload, "query",functionName);
		//END EXAMPLE CODE

	}


	//V2.0
	thisObj.populateDetailImage = function(imgURL){

		var masterHTML = '<img src="'+imgURL+'" />'
		$('.table-detail.active .detail-image').html(masterHTML);

	}

	//V2.1
	thisObj.populateButtonData = function(buttonName,buttonData){

		$('.form-button-alt[name="'+buttonName+'"] .button-data').html(buttonData);

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

	//V2.0
	thisObj.populateTableRow = function(auctionID, itemID, ownerID, index){

		var indexInt = parseInt(index);
		var oddClass = ' even';
		if(indexInt%2 == 0) {
			oddClass = ' odd';
		}
		var masterHTML = '<tr auction-id="'+auctionID+'" class="table-row'+oddClass+'"><td class="table-cell action-cell" action-type="function" function-name="table-auction">'+auctionID+'</td><td class="table-cell action-cell" action-type="function" function-name="table-item">'+itemID+'</td><td class="table-cell action-cell" action-type="function" function-name="table-owner">'+ownerID+'</td><td class="table-cell action-cell button-cell" action-type="function" function-name="auction-open" auction-id="'+auctionID+'">Open Auction</td></tr><tr class="table-detail odd"><td class="detail-container" colspan="4"><div class="detail-header"><div class="detail-actions"><div class="action-button" function-name="detail-close" action-type="function"></div></div></div><div class="detail-content"><div class="detail-body"></div><div class="detail-image"></div></div><div class="detail-footer"></div></td></tr>';
		$('.table-body').append(masterHTML)

	}


	thisObj.getAuctions = function(){

		//MAKE API CALL TO GET AUCTION LIST HERE
		//RETURN API DATA TO "populateTable" FUNCTION BELOW.
		//REMOVE DEBUG LINE BELOW
		//call the below when response received
		var functionName = "GetListOfInitAucs";
		var payload = constructPayload("query",functionName , ["2016"])
		RestCall(payload, "query", functionName);
		//thisObj.populateAuctionsTable({});
	}


	thisObj.populateAuctionsTable = function(data){
		var obj = JSON.parse(data)
		var count = 0;
		for (var property in obj) {
			//thisObj.populateTableRow('1111','001','200',0);
			thisObj.populateTableRow(obj[count].AuctionID, obj[count].ItemID,obj[count].SellerID , count);
			count++;
		}

		//PARSE DATA RETURNED FROM API
		//USE "populateTableRow" FUNCTION ABOVE TO ADD DATA TO DOM

		//LEAVE THIS LINE AFTER DATA PARSING CODE HAS CALLED ALL "populateTableRow" FUNCTIONS
		thisObj.setTableEvents();
		//thisObj.setDetailEvents();

	}

	//V2.1
	thisObj.populateBiddingRow = function(auctionID, itemID, ownerID, endTime, index, reservedPrice){

		var indexInt = parseInt(index);
		var oddClass = ' even';
		if(indexInt%2 == 0) {
			oddClass = ' odd';
		}
    //var masterHTML = '<tr auction-id="'+auctionID+'" class="table-row'+oddClass+'"><td class="table-cell">'+auctionID+'</td><td class="table-cell">'+itemID+'</td><td class="table-cell">'+ownerID+'</td><td class="table-cell action-cell button-cell" action-type="function" function-name="bid-open" item-id="'+itemID+'">Bid Now</td></tr><tr class="table-detail odd"><td class="detail-container" colspan="4"><div class="detail-header"><div class="detail-actions"><div class="action-button" function-name="detail-close" action-type="function"></div></div></div><div class="detail-content"><div class="detail-body"></div><div class="detail-image"></div></div><div class="detail-footer"></div></td></tr>';
		var masterHTML = '<tr auction-id="'+auctionID+'" class="table-row'+oddClass+'"><td class="table-cell">'+auctionID+'</td><td class="table-cell">'+itemID+'</td><td class="table-cell">'+ownerID+'</td><td class="table-cell">$ '+reservedPrice+'</td><td class="table-cell" name="timer-display" end-time="'+endTime+'"></td><td class="table-cell action-cell button-cell" action-type="function" function-name="bid-open" item-id="'+auctionID+"-"+itemID+"-"+ownerID+"-"+reservedPrice+'">Bid Now</td></tr><tr class="table-detail odd"><td class="detail-container" colspan="6"><div class="detail-header"><div class="detail-actions"><div class="action-button" function-name="detail-close" action-type="function"></div></div></div><div class="detail-content"><div class="detail-body"></div><div class="detail-image"></div></div><div class="detail-footer"></div></td></tr>';
		$('.table-body').append(masterHTML)
	}

	//V2.1
	thisObj.UpdateAuctionTimers = function(){

		$('.table-cell[name="timer-display"]').each(function(index){
			var endTime = parseInt($(this).attr('end-time'));
			var now = new Date();
			var currentUtcTime = new Date(now.getTime() + now.getTimezoneOffset() * 60000).getTime();
			var endTimeDiff = new Date(endTime).getTime()-currentUtcTime;
			if (endTimeDiff <= 0) {
				$(this).html('<b>Auction Closed</b>');
				// Hide Bid Now button
				$(this).next().hide();
				//Don't allow user to enter any more bids
				//thisObj.hideTableDetail();
				$(this).parents('.table-row').next().removeClass('active');

				return;
			}
			var endTimeDisplay = thisObj.getTimeDisplay(endTimeDiff);
			$(this).html(endTimeDisplay);
		});

	}

	//V2.1
	thisObj.getTimeDisplay = function(duration){
	    var milliseconds = parseInt((duration%1000)/100)
	        , seconds = parseInt((duration/1000)%60)
	        , minutes = parseInt((duration/(1000*60))%60)
	        , hours = parseInt((duration/(1000*60*60))%24);

	    hours = (hours < 10) ? "0" + hours : hours;
	    minutes = (minutes < 10) ? "0" + minutes : minutes;
	    seconds = (seconds < 10) ? "0" + seconds : seconds;

	    return hours + ":" + minutes + ":" + seconds;
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
	//V2.0
	thisObj.populateAuctionForm = function(data){
		//LEAVE THIS CODE TO ADD AUCTION FORM TO TABLE DROP DOWN
		//var masterHTML = '<div class="form-container"><div class="form-header"><div class="form-title">Set Auction Duration</div><div class="form-messages"><div class="form-message success">Auction opened successfully</div><div class="form-message error">Auction opening failed</div></div></div><div class="form-content"><div class="form-body"><div class="body-column column-1 half"><div class="form-item"><div class="item-label">Auction Duration</div><div class="item-content"><div class="form-input"><input name="auction_duration" id="auction_duration" type="text" value="" tabindex="1"><input style="visibility: hidden;" hidden_aucid="'+data+'" type="text"></div></div></div></div></div></div><div class="form-footer"><div class="form-specs"><div class="form-spec left"></div><div class="form-spec right"></div></div><div class="form-button" tabindex="2"><div class="button-label">Open Auction</div></div></div></div>';
		var masterHTML = '<div class="form-container"><div class="form-header"><div class="form-title">Set Auction Duration</div><div class="form-messages"><div class="form-message success">Auction opened successfully</div><div class="form-message error">Auction opening failed</div></div></div><div class="form-content"><div class="form-body"><div class="body-column column-1 half"><div class="form-item"><div class="item-label">Auction Duration</div><div class="item-content"><div class="form-input"> <input name="auction_duration" id="auction_duration" type="text" value="" tabindex="1"> <input style="visibility: hidden;" id="hidden_aucid" value="'+data+'" type="text"></div></div></div></div></div></div><div class="form-footer"><div class="form-specs"><div class="form-spec left"></div><div class="form-spec right"></div></div><div class="form-button" tabindex="2"><div class="button-label">Open Auction</div></div></div></div>';
		$('.table-detail.active .detail-body').html(masterHTML);

		//LEAVE THIS LINE AFTER DATA PARSING CODE HAS CALLED ALL "populateFormField" FUNCTIONS
		thisObj.setDetailEvents();
	}

	//V2.1
	thisObj.populateBidding = function(data){
		var obj = JSON.parse(data)
		var count = 0;
		for (var property in obj) {
			//thisObj.populateTableRow('1111','001','200',0);
			var endDate = new Date(new Date(obj[count].CloseDate).toISOString()).getTime();
			thisObj.populateBiddingRow(obj[count].AuctionID, obj[count].ItemID, obj[count].AuctionHouseID, endDate, count, obj[count].ReservePrice);
			count++;
		}
		thisObj.setTableEvents();
    thisObj.setDetailEvents();
	}

	thisObj.auctionID = '';

	thisObj.populateBiddingForm = function(data){
    //TODO: Split the value to AuctionID+ ItemID + Current Ownerra ID : 7967-1000-200
		var res = data.split("-");
		//var masterHTML = '<div class="form-container"><div class="form-header"><div class="form-title">Bid on Item</div><div class="form-messages"><div class="form-message success">Bid submitted successfully</div><div class="form-message error">Bid submission failed</div></div></div><div class="form-content"><div class="form-body"><div class="body-column column-1 half"><div class="form-item"><div class="item-label">Auction ID</div><div class="item-content"><div class="form-input"><input name="bid_auction" id="bid_auction" type="text" value="" tabindex="1"></div></div></div><div class="form-item"><div class="item-label">Item ID</div><div class="item-content"><div class="form-input"><input name="bid_item" id="bid_item" type="text" value="" tabindex="3"></div></div></div><div class="form-item"><div class="item-label">Current Owner ID</div><div class="item-content"><div class="form-input"><input name="bid_owner" id="bid_owner" type="text" value="" tabindex="5"></div></div></div><div class="form-item"><div class="item-label">Bid Time</div><div class="item-content"><div class="form-input"><input name="bid_time" id="bid_time" type="text" value="" tabindex="7"></div></div></div></div><div class="body-column column-2 half"><div class="form-item"><div class="item-label">Bid ID</div><div class="item-content"><div class="form-input"><input name="bid_id" id="bid_id" type="text" value="" tabindex="2"></div></div></div><div class="form-item"><div class="item-label">Buyer ID</div><div class="item-content"><div class="form-input"><input name="bid_buyer" id="bid_buyer" type="text" value="" tabindex="4"></div></div></div><div class="form-item"><div class="item-label">Bid Price</div><div class="item-content"><div class="form-input"><input name="bid_price" id="bid_price" type="text" value="" tabindex="6"></div></div></div></div></div></div><div class="form-footer"><div class="form-specs"><div class="form-spec left"></div><div class="form-spec right"></div></div><div class="form-button" tabindex="8"><div class="button-label">Place Bid</div></div><div name="buy-now" class="form-button-alt" tabindex="8"><div class="button-label">Buy Now</div><div class="button-data"></div></div></div></div>';
		var masterHTML = '<div class="form-container"><div class="form-header"><div class="form-title">Bid on Item</div><div class="form-messages"><div class="form-message success">Bid submitted successfully</div><div class="form-message error">Bid submission failed</div></div></div><div class="form-content"><div class="form-body"><div class="body-column column-1 half"><div class="form-item"><div class="item-label">Buyer ID</div><div class="item-content"><div class="form-input"> <input name="bid_buyer" id="bid_buyer" type="text" value="" tabindex="1"></div></div></div></div><div class="body-column column-2 half"><div class="form-item"><div class="item-label">Bid Price</div><div class="item-content"><div class="form-input"> <input name="bid_price" id="bid_price" type="text" value="" tabindex="2"> <input style="display:none;" name="form_field_values" id="form_field_values" type="text" value="'+data+'" tabindex="3"></div></div></div></div></div></div> </br><div class="form-footer"><div class="form-specs"><div class="form-spec left"></div><div class="form-spec right"></div></div><div class="form-button" tabindex="3"><div class="button-label" id="submit_bid_button">Place Bid</div></div><div name="buy-now" class="form-button-alt" tabindex="8"><div class="button-label">Buy It Now</div><div class="button-data"></div></div></div> <br/><div style="align: right; float: right;font-size: smaller;"><small>* BuyItNow price is 40% higher than reserved price</small></div></div>';
		$('.table-detail.active .detail-body').html(masterHTML);
		thisObj.auctionID = res[0];
		var butNowPrice = Math.round((parseInt(res[3]) * 1.4)).toString();
		thisObj.populateButtonData('buy-now', '$ '+butNowPrice);
		//ADJUST THE INTERVAL TO UPDATE THE CURRENT BIDS BELOW
		//CURRENTLY SET TO 30 SECONDS
		var bidInterval = 10000; // TODO: Change the polling time
		var updateBids = setInterval(function(){

			if (thisObj.auctionID ){
				var method = "query";
				var args = [thisObj.auctionID];
				//args.push (key);
				var functionName = "GetLastBid";
				payload = constructPayload(method, functionName, args);
				RestCall(payload, method, functionName);
				functionName = "GetHighestBid";
				payload = constructPayload(method, functionName, args);
				RestCall(payload, method, functionName);
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

}

RestCall = function (payload, method, functionName, auctionID){
	console.log(JSON.stringify(payload));
	$.ajax({
	    url : "http://localhost:5000/chaincode",
	    type: "POST",
	    data : JSON.stringify(payload),
	    success: function(data, textStatus, jqXHR)
	    {
		//TODO: How to handle the limitation in chaincode REST response when container creation failed ?
		if (method == "deploy") {
			//localStorage.isDeploySuccess = true;
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
					case "GetListOfInitAucs":
						tableApp.populateAuctionsTable(res);
						break;
					case "GetListOfOpenAucs":
					  console.log(res);
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
				if ( functionName === 'OpenAuctionForBids'){
					console.log("Open Auction for BIDS is successful !!");
					tableApp.finishTableAuction(auctionID);
				} else if (functionName === 'CloseOpenAuctions'){
					console.log("Checking if any auctions can be closed	");
				}
			}else {
				console.log("Error : Invalid request")
			}
		}
		/*else {
			console.log("Error : Check chaincode logs for more details")
			showSuccsessFailureMessage(false);
		}*/
	    },
	    error: function (jqXHR, textStatus, errorThrown)
	    {
				showSuccsessFailureMessage(false);
				console.log("Failure :"+textStatus);
	    }
	});
}
