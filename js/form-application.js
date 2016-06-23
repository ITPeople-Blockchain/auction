//TODO: Can we do this better ? Make sure these maps are in sync with Form ids and RecordType enums in Go

//TODO: Change this path according to the application path
var path = "github.com/hyperledger/fabric/examples/chaincode/go/artfun";
var JsonRPC_Version = "2.0";
//Save chaincode Hash, TODO: should check for a better and alternate solution
var InvokeMethod = "invoke";

var recordTypeByFormID = {};
//"USER","ARTINV",  "BID", "AUCREQ", "POSTTRAN", "OPENAUC", "CLAUC"
recordTypeByFormID['user-register'] = 'USER';
recordTypeByFormID['item-register'] = 'ARTINV';
recordTypeByFormID['item-auction'] = 'AUCREQ';
recordTypeByFormID['item-bid'] = 'BID';
/*"PostItem":           PostItem,
"PostUser":           PostUser,
"PostAuctionRequest": PostAuctionRequest,
"PostTransaction":    PostTransaction,
"PostBid":            PostBid,
"OpenAuctionForBids": OpenAuctionForBids,
"CloseAuction":       CloseAuction,*/

var functionByRecType = {};
functionByRecType['USER'] = 'PostUser';
functionByRecType['ARTINV'] = 'PostItem';
functionByRecType['AUCREQ'] = 'PostAuctionRequest';
functionByRecType['BID'] = 'PostBid';

var methodIdMap = {};
methodIdMap['deploy'] = 1;
methodIdMap['invoke'] = 3;
methodIdMap['query'] = 5;

function formApplication(){ 

	var thisObj = this;

	thisObj.init = function(){
		console.log('INIT FORM APPLICATION');
		thisObj.setPrimaryEvents();
		thisObj.formLoaded();

		deployChaincode();
		if (!sessionStorage.isDeploySuccess) {
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
		if (!formButton) {
			console.log("Invalid formButton Object");
			return;
		}
		var functionName = '';
		var recType = '';
		var args = [];
		//console.log("Button Name :");
		//console.log(formButton.children("div")[0].id);
		// this is a special case where we need to Submit the current for auction
		if(formButton.children("div")[0] && formButton.children("div")[0].id == 'art_submit_auction' ) {
			//alert ("################### Put on auction")
			recType = 'AUCREQ';
			functionName = functionByRecType[recType];
			var fieldValue = '';
			var ips = $( ":input" );
/*
        AuctionID      string
	RecType        string // AUCREQ
	ItemID         string
	AuctionHouseID string // ID of the Auction House managing the auction
	SellerID       string // ID Of Seller - to verified against the Item CurrentOwnerId
	RequestDate    string // Date on which Auction Request was filed
	ReservePrice   string // reserver price > previous purchase price
	Status         string // INIT, OPEN, CLOSED (To be Updated by Trgger Auction)
	OpenDate       string // Date on which auction will occur (To be Updated by Trigger Auction)
	CloseDate      string // Date and time when Auction will close (To be Updated by Trigger Auction)
*/
			//["2000", "Shadows by Asppen", "Painted by famed Mughal era Painter Qasim", "10102015", "Original – could be a Reprint", "Miniature", "Acrylic", "15” x 20”", "$600", "100"]
			args.push('1111'); // How do we generate ID ?			
			//args.push(recType);
			args.push(ips[0].value);
			args.push('200'); // how do we get AuctionHouse ID 
			args.push(ips[9].value);
			args.push(new Date().toString());
			var str = ips[8].value;
			args.push((parseInt(str.substring(1, str.length)) * 1.4).toString());
			args.push("INIT");
			args.push(new Date().toString());
			args.push(new Date().toString());
			/*for (var i=0;i<ips.length;i++){
				//console.log('################# '+ips[i].value)
				fieldValue = ips[i].value;
				if (!fieldValue || fieldValue == '') {
					console.log(" ###### Field values shouldn't be empty ###### ")
					return;
				}
				args.push(fieldValue);
			}*/
			console.log(args);
		} else {
			//alert ("################### Other auction")
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
				args.push(fieldValue);
			}
			// Add recordType as second param in args
		}
		// Add recordType as second param in args
		args.splice(1, 0, recType);
		console.log(args);
		payloadHandler(functionName, recType, args);
	}

	//TODO: Can't be called from out side thisObj methods, remove them ??
	thisObj.formSuccess = function(actionForm){
		actionForm.addClass('success');
		var functionDelay = setTimeout(function(){
			$('.form-container').removeClass('success');
			$('.form-button').blur();
		},3000);
	}

	thisObj.formError = function(actionForm){
		//Should we have red color for error
		actionForm.addClass('error');
		/*var functionDelay = setTimeout(function(){
			$('.form-container').removeClass('error');
			$('.form-button').blur();
		},3000);*/
	}

	//API
	thisObj.urlParam = function(name){
		var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
		if (!results || results.length == 0) {
			return ''
		}
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
		//alert($('#'+fieldID).val(fieldData));

	}
	thisObj.getItemRegister = function(){

	}

	thisObj.getUserRegister = function(){
		
	}

	thisObj.getItemAuction = function(){
		
	}

	thisObj.getItemBid = function(){
		
	}


	thisObj.populateItemDetail = function(data){
//		alert("Great Query execution is successful !!");
		var obj = JSON.parse(data);
		//alert(Object.keys(obj).length);
		/*var display = '';
		for (name in obj) {
			display += name + ' \n';
		}*/
/*
ItemDesc 
ItemDetail 
ItemDate 
ItemType 
ItemSubject 
ItemMedia 
ItemSize 
//ItemPicFN 
//ItemImage 
//AES_Key 
//ItemImageType 
ItemBasePrice 
CurrentOwnerID

*/
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

		$('#art_image').css('background-image', 'url(' +obj['ItemPicFN'] + ')');
	}


	thisObj.populateItemRegister = function(data){
		
	}

	thisObj.populateUserRegister = function(data){
		
	}

	thisObj.populateItemAuction = function(data){
		
	}

	thisObj.populateItemBid = function(data){
		
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
	console.log("In payloadHandler");
	// TODO: determine query or invoke based on button type
	var method = "invoke";
	//args = constructArgsByFormID("userRegisterPage", recordType);
	payload = constructPayload(method, functionName, args);
	//payload = constructPayload(method, functionByRecType[recordType], args);
	isSuccess = makeRestCall(payload, method, recordType);
	console.log(isSuccess);
}

userRegistrationHandler = function(args){
	console.log("In userRegistrationHandler");
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
	    url : "http://localhost:5000/chaincode",
	    type: "POST",
	    data : JSON.stringify(payload),
	    success: function(data, textStatus, jqXHR)
	    {
		//TODO: How to handle the limitation in chaincode REST response when container creation failed ?
		if (method == "deploy") {
			sessionStorage.isDeploySuccess = true;
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
				console.log("Deloyment  Successful ??");
				//TODO:  Unblock UI ?
			} else if (method == "invoke") {
				console.log("################# Invoke Successful ??");
				showSuccsessFailureMessage(true);
			} else if (method == "query"){
				console.log("################# Query is Successful !!");
				if (recordType == 'ARTINV') {
					//pass the result 'res'
					formApp.populateItemDetail(res);
				}
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
