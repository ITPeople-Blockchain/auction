
var path = "https://github.com/ITPeople-Blockchain/auction/art/artchaincode";
//var path = "https://github.com/ratnakar-asara/auction/art/artchaincode";
var JsonRPC_Version = "2.0";
//Save chaincode Hash, TODO: should check for a better and alternate solution
var InvokeMethod = "invoke";

var recordTypeByFormID = {};
//"USER","ARTINV",  "BID", "AUCREQ", "POSTTRAN", "OPENAUC", "CLAUC"
recordTypeByFormID['user-register'] = 'USER';
recordTypeByFormID['item-register'] = 'ARTINV';
recordTypeByFormID['item-auction'] = 'AUCREQ';
recordTypeByFormID['item-bid'] = 'BID';

var functionByRecType = {};
functionByRecType['USER'] = 'PostUser';
functionByRecType['ARTINV'] = 'PostItem';
functionByRecType['AUCREQ'] = 'PostAuctionRequest';
functionByRecType['BID'] = 'PostBid';
functionByRecType['OPENAUC'] = 'OpenAuctionForBids';

var methodIdMap = {};
methodIdMap['deploy'] = 1;
methodIdMap['invoke'] = 3;
methodIdMap['query'] = 5;

var auctionID = 0;
function formApplication(){

	var thisObj = this;
    thisObj.itemID = '';
	  thisObj.init = function(){
		//console.log('INIT FORM APPLICATION');
		thisObj.setPrimaryEvents();
		thisObj.formLoaded();
		if (!localStorage.getItem("chaincodeHash") || localStorage.getItem("chaincodeHash") === '') {
			deployChaincode();
		}
	}

	thisObj.setPrimaryEvents = function(){
		//FORMS
		$('.form-page .form-button').click(function(){
			var actionItem = $(this);
			thisObj.submitForm(actionItem);
		});

	}

	//FORMS

	thisObj.loadForm = function(actionForm,args){
		var formName = actionForm.attr('form-name');
		var formArgs = '';
		if(args!=undefined&&args!=null){
			formArgs = args;
		}
		window.open(formName+'.html'+formArgs,"_self");
	}

	//V2.0
	thisObj.submitForm = function(formButton){
/*
		var actionForm = formButton.parents('.form-container');

		var loadedForm = $('body').attr('name');

		switch (loadedForm){
			case 'item-detail':
				thisObj.submitItemDetail(actionForm);
				break;
			case 'item-register':
				thisObj.submitItemRegister(actionForm);
				break;
			case 'user-register':
				thisObj.submitUserRegister(actionForm);
				break;
			case 'item-auction':
				thisObj.submitItemAuction(actionForm);
				break;
			case 'item-bid':
				thisObj.submitItemBid(actionForm);
				break;
			case 'list-bidding':
				thisObj.submitItemBid(actionForm);
				break;
			case 'list-auctions':
				thisObj.submitOpenAuction(actionForm);
				break;
		}
*/

		if (!formButton) {
			console.log("Invalid formButton Object");
			return;
		}
		var actionForm = formButton.parents('.form-container');
		var functionName = '';
		var recType = '';
		var args = [];
		// this is a special case where we need to Submit selected Item for auction
		if(formButton.children("div")[0] && formButton.children("div")[0].id == 'art_submit_auction' ) {
			recType = 'AUCREQ';
			functionName = functionByRecType[recType];
			var fieldValue = '';
			var ips = $( ":input" );
			//["2000", "Shadows by Asppen", "Painted by famed Mughal era Painter Qasim", "10102015", "Original", "Miniature", "Acrylic", "15” x 20”", "$600", "100"]
			auctionID = getUUID();
			args.push(auctionID); // How do we generate ID ?
			//args.push(recType);
			args.push(ips[0].value);
			args.push('200'); // how do we get AuctionHouse ID
			args.push(ips[9].value);
			args.push(new Date().toString());
			var str = ips[8].value;
			args.push((parseInt(str.substring(1, str.length)) * 1.4).toString());
			//How to handle this ?
			args.push("0");//TODO: enable once BuyItNowPrice enabled from UI
			args.push("INIT");
			args.push(new Date().toString());
			args.push(new Date().toString());
			console.log(args);
		} else if(formButton.children("div")[0] && formButton.children("div")[0].id == 'submit_bid_button' ) {
			var res = (actionForm.find("#form_field_values").val()).split("-")
			recType = 'BID';
			functionName = functionByRecType[recType];
			var fieldValue = '';
			var args = [];
			args.push(res[0])
			args.push(getUUID()) // auctionID+ItemID+buyer ID Generates Bid number
			args.push(res[1]) //bid_price
			var bid_buyer_val = actionForm.find("#bid_buyer").val();
			var bid_price_val = actionForm.find("#bid_price").val();
			if (!bid_buyer_val || !bid_price_val || bid_buyer_val === '' || bid_price_val === ''){
				//TODO: update failure message ?
				return;
			}
			args.push(bid_buyer_val) // GET BUYER ID FROM FORM //bid_buyer
			args.push(bid_price_val) //GET THE PRICE //bid_price
		} else if(formButton.children("div")[0] && formButton.children("div")[0].id == 'bid_submit_button'){
			var actionForm = formButton.parents('.form-container');
			recType = recordTypeByFormID[actionForm[0].id];
			functionName = functionByRecType[recType];
			var fieldValue = '';
			var ips = $( ":input" );
			for (var i=0;i<ips.length;i++){
				//console.log('################# '+ips[i].value)
				fieldValue = ips[i].value;
				if (!fieldValue || fieldValue == '') {
					console.log(" ###### Field values shouldn't be empty ###### ")
					//TODO: Update error message
					return;
				}
				if (i== 0) {
					thisObj.itemID = fieldValue;
				} else if (i == 1){
					args.push(getUUID())
				}
				args.push(fieldValue);
			}
			//return;
		} else if (actionForm.find("#hidden_aucid") && actionForm.find("#hidden_aucid").val()){
			auctionId = actionForm.find("#hidden_aucid").val();
			console.log('AUCTION ID: ' + auctionId);
			recType = 'OPENAUC';
			//OpenAuctionForBids "Args":["1111", "OPENAUC", "1"]}'
			functionName = functionByRecType[recType];
			var args = [];
			args.push(auctionId);
			args.push("OPENAUC");
			var ips = $( ":input" );
			args.push(ips[0].value); //Duration from text field
			var payload = constructPayload("invoke",functionName , args);
			RestCall(payload, "invoke", functionName, auctionId);
			return;
	  } else {
			var actionForm = formButton.parents('.form-container');
			recType = recordTypeByFormID[actionForm[0].id];
			functionName = functionByRecType[recType];
			var fieldValue = '';
			var ips = $( ":input" );
			for (var i=0;i<ips.length;i++){
				fieldValue = ips[i].value;
				if (!fieldValue || fieldValue == '') {
					console.log(" ###### Field values shouldn't be empty ###### ")
					return;
				}
				args.push(fieldValue);
			}
			// Add recordType as second param in args
		}
		// Add recordType as second param in args
		args.splice(1, 0, recType);
		console.log(args);
		payloadHandler(functionName, recType, args);
	}

	//V2.1
	thisObj.submitAltForm = function(formButton){
		var actionForm = formButton.parents('.form-container');

		var loadedForm = $('body').attr('name');

		switch (loadedForm){
			case 'list-bidding':
				thisObj.submitItemBuy(actionForm);
				break;
		}
	}

	thisObj.formResult = function(actionForm,result){
		actionForm.addClass(result);
		var functionDelay = setTimeout(function(){
			$('.form-container').removeClass(result);
			$('.form-button').blur();
		},3000);
	}

	thisObj.submitItemDetail = function(actionForm){

		//USE THIS FUCNTION IF SUCCESS
		thisObj.formResult(actionForm,'success');

		//USE THIS FUCNTION IF ERROR
		//thisObj.formResult(actionForm,'error');
	}

	thisObj.submitItemRegister = function(actionForm){

		//USE THIS FUCNTION IF SUCCESS
		thisObj.formResult(actionForm,'success');

		//USE THIS FUCNTION IF ERROR
		//thisObj.formResult(actionForm,'error');
	}

	thisObj.submitUserRegister = function(actionForm){

		//USE THIS FUCNTION IF SUCCESS
		thisObj.formResult(actionForm,'success');

		//USE THIS FUCNTION IF ERROR
		//thisObj.formResult(actionForm,'error');
	}

	thisObj.submitItemAuction = function(actionForm){

		//USE THIS FUCNTION IF SUCCESS
		thisObj.formResult(actionForm,'success');

		//USE THIS FUCNTION IF ERROR
		//thisObj.formResult(actionForm,'error');
	}

	thisObj.submitItemBid = function(actionForm){

		console.log('SUBMIT ITEM BID');

		//USE THIS FUCNTION IF SUCCESS
		thisObj.formResult(actionForm,'success');

		//USE THIS FUCNTION IF ERROR
		//thisObj.formResult(actionForm,'error');
	}

	//V2.1
	thisObj.submitItemBuy = function(actionForm){

		console.log('SUBMIT ITEM BUY');
		var res = (actionForm.find("#form_field_values").val()).split("-")
		recType = 'BID';
		var functionName = functionByRecType[recType];
		var fieldValue = '';
		var args = [];
		args.push(res[0]);
		args.push(recType);
		args.push(getUUID()); // auctionID+ItemID+buyer ID Generates Bid number
		args.push(res[1]);

		var bid_buyer_val = actionForm.find("#bid_buyer").val();
		if (!bid_buyer_val || bid_buyer_val === ''){
			console.log('Please provide user ID ');
			//TODO: update failure message ?
			return;
		}
		args.push(bid_buyer_val) // GET BUYER ID FROM FORM //bid_buyer
		var buyItNowPrice = (parseInt(res[3]) * 1.4).toString();
		args.push(buyItNowPrice);  //BuyItNow bid_price

		console.log(args);

		payloadHandler(functionName, recType, args);

	}

	//V2.0
	thisObj.submitOpenAuction = function(actionForm){

		console.log('SUBMIT OPEN AUCTION');

		//USE THIS FUCNTION IF SUCCESS
		thisObj.formResult(actionForm,'success');

		//USE THIS FUCNTION IF ERROR
		//thisObj.formResult(actionForm,'error');

		var auctionID = actionForm.parents('tr.table-detail').prev().attr('auction-id');
		tableApp.finishTableAuction(auctionID);
	}

	thisObj.populateFormField = function(fieldID,fieldData){
		$('#'+fieldID).val(fieldData);
	}

	thisObj.populateFormOption = function(selectID,optionData){
		//console.log('POPULATE FORM OPTION');
		var masterHTML = '<option value="'+optionData+'">'+optionData+'</option>'
		$('#'+selectID).append(masterHTML);
	}

	thisObj.populateFormImage = function(imgURL){
		//work around to get the image
		//imgURL = '../art/artchaincode/'+imgURL;
		imgURL = './imgs/'+imgURL;
		$('.form-image .item-image').css('background-image','url('+imgURL+')')
	}

	thisObj.populateFormIndicator = function(labelVal,contentVal){
		var masterHTML = '<div class="indicator-item"><div class="indicator-label">'+labelVal+'</div><div class="indicator-content">'+contentVal+'</div></div>'
		$('.form-indicators').append(masterHTML);
	}

	//Ratnakar
	/*thisObj.populateFormSpec = function(labelVal,contentVal){
		var masterHTML = '<div class="spec-item"><div class="spec-label">'+labelVal+'</div><div class="spec-content"> $'+contentVal+'</div></div>'
		//$('.form-specs').empty().append(masterHTML);
		$('.form-specs').append(masterHTML);
	}*/
	//V2.1
	thisObj.populateFormSpec = function(labelVal,contentVal,specPosition){
		var masterHTML = '<div class="spec-item"><div class="spec-label">'+labelVal+'</div><div class="spec-content">'+contentVal+'</div></div>'
		$('.form-spec.'+specPosition).append(masterHTML);
	}


	//API

	thisObj.urlParam = function(name){
		var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
		/*if (!results || results.length == 0) {
			return ''
		}*/
		return results[1] || 0;
	}

	thisObj.formLoaded = function(){
		var loadedForm = $('body').attr('name');

		switch (loadedForm){
			case 'item-detail':
				thisObj.getItemDetail();
				break;
			case 'item-register':
				thisObj.getItemRegister();
				break;
			case 'user-register':
				thisObj.getUserRegister();
				break;
			case 'item-auction':
				thisObj.getItemAuction();
				break;
			case 'item-bid':
				thisObj.getItemBid();
				break;
		}
	}


	thisObj.getItemDetail = function(){
		var formName = $('body').attr('name');
		var itemID = thisObj.urlParam('item-id');
		console.log('ITEM ID: ' + itemID);
		console.log('formName: ' + formName);
		if (!itemID || itemID == ''){
			//Cannot proceedfurther
			return;
		}
		/*var args = [];
		args.push(itemID);
		args.push("Shadows by Asppen");*/
		//MAKE API CALL USING "itemID" variable here.
		//RETURN API DATA TO "populateItemDetail" function below.
		thisObj.populateFormField("art_id", itemID);
		getQueryPayload (itemID, "ARTINV", formName)
	}

	thisObj.populateFormField = function(fieldID,fieldData){
		$('#'+fieldID).val(fieldData);

	}

	//V2.0
	thisObj.getItemRegister = function(){

		//MAKE API CALL TO GET USER DROPDOWN OPTIONS
		//RETURN API DATA TO "populateItemRegister" FUNCTION BELOW.
		//REMOVE DEBUG LINE OF CODE BELOW IF USING API CALL
		//LEAVE LINE OF CODE BELOW IF MANUALLY POPULATING OPTIONS USING "populateItemRegister"
		thisObj.populateItemRegister({});

	}

	//V2.0
	thisObj.getUserRegister = function(){

		//MAKE API CALL TO GET DROPDOWN OPTIONS
		//RETURN API DATA TO "populateUserRegister" FUNCTION BELOW.
		//REMOVE DEBUG LINE OF CODE BELOW IF USING API CALL
		//LEAVE LINE OF CODE BELOW IF MANUALLY POPULATING OPTIONS USING "populateUserRegister"
		thisObj.populateUserRegister();

	}

	thisObj.getItemAuction = function(){

	}

	thisObj.getItemBid = function(){

		var formName = $('body').attr('name');
		var itemID = thisObj.urlParam('item-id');

		//MAKE API CALL USING "itemID" variable here.
		//RETURN API DATA TO "populateItemDetail" function below.
		thisObj.populateFormField("bid_art_id", itemID);

		//LEAVE THE CODE BELOW TO GET CURRENT BIDS
		//ADJUST THE INTERVAL TO UPDATE THE CURRENT BIDS BELOW
		//CURRENTLY SET TO 5 SECONDS
		var bidInterval = 5000;
		var updateBids = setInterval(function(){
			//console.log(thisObj.itemID)

			//Call this from REST call
			thisObj.getCurrentBids();
		},bidInterval);

	}

	thisObj.getCurrentBids = function(){

		var itemID = thisObj.urlParam('item-id');
		//console.log('ITEM ID: ' + itemID);

		//MAKE API CALL USING "itemID" variable here.
		//RETURN API DATA TO "populateCurrentBids" function below.
		//REMOVE DEBUG LINE OF CODE BELOW
		thisObj.populateCurrentBids({});

	}


	thisObj.populateItemDetail = function(data){
		var obj = JSON.parse(data);
		//USE "populateFormField" function above to add data to DOM

		thisObj.populateFormField('art_description', obj['ItemDesc']);
		thisObj.populateFormField('art_artist', obj['ItemDetail']);
		thisObj.populateFormField('art_date', obj['ItemDate']);
		thisObj.populateFormField('art_type', obj['ItemType']);
		thisObj.populateFormField('art_subject', obj['ItemSubject']);
		thisObj.populateFormField('art_media', obj['ItemMedia']);
		thisObj.populateFormField('art_size', obj['ItemSize']);
		thisObj.populateFormField('art_price', obj['ItemBasePrice']);
		thisObj.populateFormField('art_owner', obj['CurrentOwnerID']);
		var imgurl = './imgs/'+obj['ItemPicFN'];
		//alert(imgurl);
		$('#art_image').css('background-image', 'url(' + imgurl+ ')');

		// How do you decide this item is associated with which Auction ?
		//peer chaincode query -l golang -n mycc -c '{"Function": "GetListOfInitAucs", "Args": ["2016"]}'
		var method = "query";
		//var payload = constructPayload(method, "GetListOfInitAucs", ["2016"]);
    var args = [];
		args.push(obj['ItemID'])
		args.push("VERIFY")
		var payload = constructPayload(method, "IsItemOnAuction", args);
		makeRestCall(payload, method, args[1]);
	}

	//V2.0
	thisObj.populateItemRegister = function(data){

		//PARSE DATA RETURNED FROM API
		//USE "populateFormField" and/or "populateFormOption" function above to add data to DOM

		thisObj.populateFormOption('art_image','Original');
		thisObj.populateFormOption('art_image','Reprint');
		thisObj.populateFormOption('art_owner','landscape');
		thisObj.populateFormOption('art_owner','modern');
		thisObj.populateFormOption('art_description','Acrylic');
		thisObj.populateFormOption('art_description','Canvas');
		thisObj.populateFormOption('art_description','Water Color');
		//TODO: Its not the right way ...
		thisObj.populateFormOption('art_size','sample.png');
		for (var i=1;i<8;i++){
			thisObj.populateFormOption('art_size','art'+i+'.png');
		}
		for (var i=1;i<=8;i++){
			thisObj.populateFormOption('art_size','item-00'+i+'.jpg');
		}
		thisObj.populateFormOption('art_size','mad-fb.jpg');
		thisObj.populateFormOption('art_size','people.gif');
	}

	//V2.0
	thisObj.populateUserRegister = function(data){

		//PARSE DATA RETURNED FROM API
		//USE "populateFormField" and/or "populateFormOption" function above to add data to DOM

	  // Auction House (AH), Bank (BK), Buyer or Seller (TR), Shipper (SH), Appraiser (AP)
		thisObj.populateFormOption('user_type','Buyer/Seller');
		thisObj.populateFormOption('user_type','Auction House');
		thisObj.populateFormOption('user_type','Shipper');
		thisObj.populateFormOption('user_type','Bank');
		thisObj.populateFormOption('user_type','Appraiser');
	}

	thisObj.populateItemAuction = function(data){

	}

	thisObj.populateItemBid = function(data){
		var obj = JSON.parse(data);
		for (prop in obj) {
			console.log(obj[prop])
		}

		//PARSE DATA RETURNED FROM API
		//USE "populateFormField" function above to add data to DOM

		//EXAMPLE START
		//REPLACE THIS EXAMPLE WITH DATA PARSER WITH MULTIPLE "populateFormField" CALLS FOR EACH INDIVIDUAL FIELD
		//populateFormField(FIELD ID, FIELD CONTENT)
		//thisObj.populateFormField('bid_auction_id','1111');
		//thisObj.populateFormField('bid_art_id','1000');

		//EXAMPLE END

	}

	//V2.1
	thisObj.populateCurrentBids = function(data){

		console.log('UPDATED CURRENT BIDS');

		//LEAVE THIS LINE OF CODE TO CLEAR SPECS BEFORE POPULATING NEW
		$('.form-spec').html('');

		//PARSE DATA RETURNED FROM API
		//USE "populateFormSpec" function above to add data to DOM

		//EXAMPLE START
		//REPLACE THIS EXAMPLE WITH DATA PARSER WITH MULTIPLE "populateFormSpec" CALLS FOR EACH INDIVIDUAL FIELD
		//populateFormField(SPEC LABEL, SPEC CONTENT, SPEC POSITION)
		thisObj.populateFormSpec('Highest Bid','$67,890','left');
		thisObj.populateFormSpec('Last Bid','$67,890','right');
		//EXAMPLE END

	}
	//TODO: Combine the below two functions
	thisObj.populateHeighestBid = function(data){
		var obj = JSON.parse(data)
		thisObj.populateFormSpec('Highest Bid :', obj.BidPrice);
	}

	//V2.0
	thisObj.hideButton = function(){
		$('.form-button').hide();
	}


	thisObj.populateLastBid = function(data){
		var obj = JSON.parse(data)
		thisObj.populateFormSpec('Last Bid :', obj.BidPrice);
	}
}

getQueryPayload = function (key, recType) {
	if (!localStorage.getItem("chaincodeHash") || localStorage.getItem("chaincodeHash") === '') {
	//if (!thisObj.chaincodeHash && thisObj.chaincodeHash === '') {
		return;
	}
	var method = "query";
	var args = [key];
	payload = constructPayload(method, "GetItem", args);
	makeRestCall(payload, method, recType);
}

payloadHandler = function(functionName, recordType, args ){
	// TODO: determine query or invoke based on button type
	var method = "invoke";
	payload = constructPayload(method, functionName, args);
	makeRestCall(payload, method, recordType);
}

/**
 * Construct Payload before making a Restcall
 */
function constructPayload(methodName, functionName, args){
	console.log("========= In constructPayload ========= ");
	//Construct Payload
	var payload = {
	  "jsonrpc": JsonRPC_Version,
	  "method": methodName,
	}
	var isInit = getPayloadID(methodName) == 1;
	payload.params = {}
	payload.params.type = 1
	if (Boolean(isInit)) {
		payload.params.chaincodeID = {
			"path": path,
			//Uncomment for DEV mode
			//"name": "mycc" //localStorage.getItem("chaincodeHash")
		}
	} else {
		payload.params.chaincodeID = {
			// "name" : "mycc" //Use this for DEV mode
			"name": localStorage.getItem("chaincodeHash")
		}
	}

	payload.params.ctorMsg = {
		"function" : functionName,
	  	"args": args,
	}
	//Get this from Nodejs
	//payload.params.secureContext = mainApp.userID;//"dashboarduser_type0_f4df8e532c";
	// get the payload ID based on method name
	payload.id = getPayloadID(methodName);
	return payload;
}

//Make a rest call and parse the result based on Record Types {"USER" , "ARTINV", "AUCREQ", "POSTTRAN"}
function makeRestCall(payload, method, recordType){
	console.log(JSON.stringify(payload));
	$.ajax({
	    url : mainApp.URL,
	    type: "POST",
	    data : JSON.stringify(payload),
	    success: function(data, textStatus, jqXHR)
	    {
		//TODO: How to handle the limitation in chaincode REST response when container creation failed ?
		if (method == "deploy") {
			//TODO: Current limitation in chaincode is that REST response is independent of container creation
			/*setTimeout(function() {
				$.unblockUI();
			}, DEPLOY_DELAY); // how do we deal container creation, if to remove delay ?*/
		}
		//data - response from server
		if (data["error"] && data["error"].message) {
			if (method == "query") {
				console.log ("Query is failed !! <br/><b>Error:</b> "+data["error"].message)
				return;
			} else if (method == "invoke") {
				console.log('################### is Invoke failed ? Err : '+data["error"].message);
				showSuccsessFailureMessage(false);
			}
			return;
		} else if (data["result"] && data["result"].message){
			var res = data["result"].message
			console.log("Results is "+res);
			if (method == "deploy") {
				// Store chaincode which is required for subsequent Invokes/Queries
				//formApp.chaincodeHash = res;
				localStorage.setItem("chaincodeHash", res);
				console.log("Deloyment  Successful");
			} else if (method == "invoke") {
				console.log("################# Invoke Successful");
				showSuccsessFailureMessage(true);
				if (recordType == 'AUCREQ'){
					formApp.populateFormIndicator("Auction ID", auctionID)
				}
				if (recordType == 'BID'){
					console.log("Bid placed successfully !!")
					//USE THIS FUCNTION IF SUCCESS
					//TODO: How to get actionForm here ?
					//formApp.formResult(actionForm,'success');
				}
				/*if (recordType === 'OPENAUC'){
					tableApp.finishTableAuction(auctionID);
				}*/

			} else if (method == "query"){
				console.log("################# Query is Successful !!");
				if (recordType == 'ARTINV') {
					//pass the result 'res'
					formApp.populateItemDetail(res);
				} else if (recordType === 'VERIFY') {
					togglePutonAuctionButton(res);
				}
				/*else if (recordType == 'BID') {
					formApp.populateItemBid(res);
				}*/
			} else {
				console.log("Error : Invalid request")
			}
		} /*else {
			console.log("Error : Check chaincode logs for more details")
			//showSuccsessFailureMessage(false);
		}*/
	    },
	    error: function (jqXHR, textStatus, errorThrown)
	    {
				if (recordType === 'BID') {
					//USE THIS FUCNTION IF ERROR
					//TODO: How to get actionForm here ?
					//formApp.formResult(actionForm,'error');
				}
				showSuccsessFailureMessage(false);
				console.log("Failure :"+textStatus);
	    }
	});
}

togglePutonAuctionButton = function(isItemOnAuc) {
	console.log(isItemOnAuc)
	if (isItemOnAuc === 'true') {
		console.log("Item is already placed on auction, Disable button...");
		formApp.hideButton();
	} else {
		console.log("Item is not yet available on auction");
	}
}

showSuccsessFailureMessage = function(isSuccess){
	var cssClass = ''
	if (Boolean(isSuccess)) {
		cssClass = 'success';
	} else {
		cssClass = 'error';
	}

	$('.form-button').parents('.form-container').addClass(cssClass);
	var functionDelay = setTimeout(function(){
			$('.form-container').removeClass(cssClass);
			$('.form-button').blur();
		},3000);
}

deployChaincode = function() {
	var method = "deploy";
	var functionName = "init";
	var args = ["INITIALIZE"];
	payload = constructPayload(method, functionName, args);
	console.log("##################### deploychaincode");
	makeRestCall(payload, method, "");
}

getPayloadID = function(methodName) {
	var id = methodIdMap[methodName];
	return id;
}

getUUID = function() {
    var a = Math.floor((Math.random() * 9) + 1);
    var b = Math.floor((Math.random() * 9) + 1);
    var c = Math.floor((Math.random() * 9) + 1);
    var d = Math.floor((Math.random() * 9) + 1);
    return a+''+b+''+c+''+d;
}
