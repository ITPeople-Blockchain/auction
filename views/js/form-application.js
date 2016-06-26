
//TODO: Change this path according to the application path
//var path = "github.com/hyperledger/fabric/examples/chaincode/go/artfun";
//var path = "https://github.com/ratnakar-asara/auction/tree/master/art/artchaincode";
var path = "https://github.com/ITPeople-Blockchain/auction/art/artchaincode";
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

var methodIdMap = {};
methodIdMap['deploy'] = 1;
methodIdMap['invoke'] = 3;
methodIdMap['query'] = 5;

var auctionID = 0;
var isDeploySucess = false;
function formApplication(){

	var thisObj = this;
  thisObj.itemID = '';
	thisObj.init = function(){
		console.log('INIT FORM APPLICATION');
		thisObj.setPrimaryEvents();
		thisObj.formLoaded();

		//if (!sessionStorage.isDeploySuccess) {
		if (!isDeploySucess) {
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
		// this is a special case where we need to Submit the current for auction
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
			//args.push("BID")
			args.push(getUUID()) // TODO: auctionID+ItemID+buyer ID Generate Bid number
			args.push(res[1]) //bid_price
			args.push(actionForm.find("#bid_buyer").val()) // GET BUYER ID FROM FORM //bid_buyer
			args.push(actionForm.find("#bid_price").val()) //GET THE PRICE //bid_price
			//console.log(args)
			//return;
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

	/*thisObj.populateFormSpec = function(specName,specData){
		$('.spec-item[name="'+specName+'"] .spec-content').html(specData);
	}*/

	thisObj.populateFormField = function(fieldID,fieldData){
		$('#'+fieldID).val(fieldData);
	}

	thisObj.populateFormImage = function(imgURL){
		//work around to get the image
		imgURL = '../art/artchaincode/'+imgURL;
		alert(imgURL);
		$('.form-image .item-image').css('background-image','url('+imgURL+')')
	}

	thisObj.populateFormIndicator = function(labelVal,contentVal){
		var masterHTML = '<div class="indicator-item"><div class="indicator-label">'+labelVal+'</div><div class="indicator-content">'+contentVal+'</div></div>'
		$('.form-indicators').append(masterHTML);
	}
	//TODO: Ratnakar, Want to use this for Current Bids ??
	/*thisObj.populateFormSpec = function(labelVal,contentVal){
		var masterHTML = '<div class="spec-item"><div class="spec-label">'+labelVal+'</div><div class="spec-content">'+contentVal+'</div></div>'
		$('.form-specs').append(masterHTML);
	}*/
	//Ratnakar
	thisObj.populateFormSpec = function(labelVal,contentVal){
		var masterHTML = '<div class="spec-item"><div class="spec-label">'+labelVal+'</div><div class="spec-content"> $'+contentVal+'</div></div>'
		//$('.form-specs').empty().append(masterHTML);
		$('.form-specs').append(masterHTML);
	}

	//API

	thisObj.urlParam = function(name){
		var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
		//TODO : do we need this ?
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
	thisObj.getItemRegister = function(){

	}

	thisObj.getUserRegister = function(){

	}

	thisObj.getItemAuction = function(){

	}

	thisObj.getItemBid = function(){

		var formName = $('body').attr('name');
		var itemID = thisObj.urlParam('item-id');
		console.log('ITEM ID: ' + itemID);
		console.log('formName: ' + formName);
		/*var args = [];
		args.push(itemID);
		args.push("Shadows by Asppen");*/
		//MAKE API CALL USING "itemID" variable here.
		//RETURN API DATA TO "populateItemDetail" function below.
		thisObj.populateFormField("bid_art_id", itemID);
		//getQueryPayload (itemID, "BID", formName)
    //thisObj.itemID = '';
		//MAKE API CALL USING "itemID" variable here.
		//RETURN API DATA TO "populateItemDetail" function below.
		//REMOVE DEBUG LINE OF CODE BELOW
		//thisObj.populateItemBid({});


		//LEAVE THE CODE BELOW TO GET CURRENT BIDS
		//ADJUST THE INTERVAL TO UPDATE THE CURRENT BIDS BELOW
		//CURRENTLY SET TO 5 SECONDS
		var bidInterval = 5000;
		var updateBids = setInterval(function(){
			//console.log(thisObj.itemID)

			//Call this from REST call
			//thisObj.getCurrentBids();
		},bidInterval);

	}

	thisObj.getCurrentBids = function(){

		var itemID = thisObj.urlParam('item-id');
		console.log('ITEM ID: ' + itemID);

		//MAKE API CALL USING "itemID" variable here.
		//RETURN API DATA TO "populateCurrentBids" function below.
		//REMOVE DEBUG LINE OF CODE BELOW
		thisObj.populateCurrentBids({});

	}


	thisObj.populateItemDetail = function(data){
		var obj = JSON.parse(data);
		//PARSE DATA RETURNED FROM API
		//USE "populateFormField" function above to add data to DOM

		//EXAMPLE
		//REPLACE THIS WITH DATA PARSER WITH MULTIPLE "populateFormField" CALLS FOR EACH INDIVIDUAL FIELD
		thisObj.populateFormField('art_description', obj['ItemDesc']);
		thisObj.populateFormField('art_artist', obj['ItemDetail']);
		thisObj.populateFormField('art_date', obj['ItemDate']);
		thisObj.populateFormField('art_type', obj['ItemType']);
		thisObj.populateFormField('art_subject', obj['ItemSubject']);
		thisObj.populateFormField('art_media', obj['ItemMedia']);
		thisObj.populateFormField('art_size', obj['ItemSize']);
		thisObj.populateFormField('art_price', obj['ItemBasePrice']);
		thisObj.populateFormField('art_owner', obj['CurrentOwnerID']);
		var imgurl = '../art/artchaincode/'+obj['ItemPicFN'];
		$('#art_image').css('background-image', 'url(' + imgurl+ ')');
	}

	thisObj.populateItemRegister = function(data){

	}

	thisObj.populateUserRegister = function(data){

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
		thisObj.populateFormField('bid_auction_id','1111');
		thisObj.populateFormField('bid_art_id','1000');

		//EXAMPLE END

	}

	thisObj.populateCurrentBids = function(data){

		console.log('UPDATED CURRENT BIDS');

		//LEAVE THIS LINE OF CODE TO CLEAR SPECS BEFORE POPULATING NEW
		$('.form-specs').html('');

		//PARSE DATA RETURNED FROM API
		//USE "populateFormSpec" function above to add data to DOM

		//EXAMPLE START
		//REPLACE THIS EXAMPLE WITH DATA PARSER WITH MULTIPLE "populateFormSpec" CALLS FOR EACH INDIVIDUAL FIELD
		//populateFormField(SPEC LABEL, SPEC CONTENT)
		thisObj.populateFormSpec('Highest Bid :','$67,890');
		thisObj.populateFormSpec('Last Bid    :','$67,890');
		//EXAMPLE END

	}
	//TODO: Combine the below two functions
	thisObj.populateHeighestBid = function(data){
		var obj = JSON.parse(data)
		thisObj.populateFormSpec('Highest Bid :', obj.BidPrice);
	}

	thisObj.populateLastBid = function(data){
		var obj = JSON.parse(data)
		thisObj.populateFormSpec('Last Bid :', obj.BidPrice);
	}
}

getQueryPayload = function (key, recType) {
	// recordType "ARTINV"
	var method = "query";
	var args = [key];
	//args.push (key);
	payload = constructPayload(method, "GetItem", args);
	//payload = constructPayload(method, functionByRecType[recordType], args);
	makeRestCall(payload, method, recType);
}

displayObj = function(object){
	var output = '';
	for (var property in object) {
  		output += property + ': ' + object[property]+'; ';
	}
	return output;
}

payloadHandler = function(functionName, recordType, args ){
	//console.log("In payloadHandler");
	// TODO: determine query or invoke based on button type
	var method = "invoke";
	//args = constructArgsByFormID("userRegisterPage", recordType);
	payload = constructPayload(method, functionName, args);
	//payload = constructPayload(method, functionByRecType[recordType], args);
	makeRestCall(payload, method, recordType);
	//console.log(isSuccess);
}

userRegistrationHandler = function(args){
	//console.log("In userRegistrationHandler");
	//TODO: Can we do this better  (Don't hardcode record types )?
	var recordType = "USER";
	var functionName = "init";
	var method = "invoke";
	var functionName = "PostUser";
	//args = constructArgsByFormID("userRegisterPage", recordType);
	payload = constructPayload(method, functionName, args);
	isSuccess = makeRestCall(payload, method, recordType);
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
			"name": "mycc",
		}
	} else {
		payload.params.chaincodeID = {
			"path": path,
			"name": "mycc",
		}
	}

	payload.params.ctorMsg = {
		"function" : functionName,
	  	"args": args,
	}
	// get the payload ID based on method name
	payload.id = getPayloadID(methodName);
	console.log(payload);
	return payload;
}

//Make a rest call and parse the result based on Record Types {"USER" , "ARTINV", "AUCREQ", "POSTTRAN"}
function makeRestCall(payload, method, recordType){
	//$.blockUI();
	console.log(JSON.stringify(payload));
	//hideResults();
	$.ajax({
	    url : mainApp.URL,//"http://localhost:5000/chaincode",
	    type: "POST",
	    data : JSON.stringify(payload),
	    success: function(data, textStatus, jqXHR)
	    {
		//TODO: How to handle the limitation in chaincode REST response when container creation failed ?
		if (method == "deploy") {
			localStorage.isDeploySuccess = true;
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
				console.log('################### is Invoke failed ?');
				showSuccsessFailureMessage(false);
			}
			return;
		} else if (data["result"] && data["result"].message){
			var res = data["result"].message

			console.log("Results is "+res);
			if (method == "deploy") {
				// Store chaincode which is required for subsequent Invokes/Queries
				chaincodeHash = res;
				isDeploySucess = true;
				console.log("Deloyment  Successful");
				//TODO:  Unblock UI ?
			} else if (method == "invoke") {
				console.log("################# Invoke Successful");
				if (recordType == 'AUCREQ'){
					formApp.populateFormIndicator("Auction ID", auctionID)
				} //TODO: should we do any thing for BID
				if (recordType == 'BID'){
					console.log("Bid placed successfully !!")
				}
				showSuccsessFailureMessage(true);
			} else if (method == "query"){
				console.log("################# Query is Successful !!");
				if (recordType == 'ARTINV') {
					//pass the result 'res'
					formApp.populateItemDetail(res);
				} /*else if (recordType == 'BID') {
					formApp.populateItemBid(res);
				}*/
			} else {
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
	//$.blockUI({ message: '<h1><img src="img/busy1.gif" /> Just a moment...</h1>' });
	var method = "deploy";
	var functionName = "init";
	var args = ["INITIALIZE"];
	payload = constructPayload(method, functionName, args);
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
