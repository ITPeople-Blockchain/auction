constructArgsByFormID = function(formID, recordType){
	var args = [];
	i = 0;
	$('#'+formID+' input').each(function(){
		i++;
		if (i == 2){
			//Chaincode expects record type as second argument (arg[1])
			args.push (recordType);
		}
		//TODO: Handle spl cases for PostAuctionRequest
		if (this.value.indexOf('.png') > 0){
			args.push('/opt/gopath/src/github.com/hyperledger/fabric/examples/chaincode/go/artfun/'+this.value);
		} else {
			args.push(this.value);
		}
	});
	return args;
}

getPayloadID = function(methodName) {
	switch(methodName) {
    	case "deploy":
      		return 1;
    	case "invoke":
      		return 3;
    	case "query":
      		return 5;
	}
}

isValidInteger = function(value) {
        if (!value || value.length == 0) {
            return false;
        }

	value = value.replace(/^\s+|\s+$/gm,'');
	return /^\d+$/.test(value);
}

showBootstrapAlert = function(type, mesg){
	$('#table-data').show();
	$("#result_mesg").show();
	//TODO: Instead can we use ID ? also can we optimize this ??
	switch (type){
	case 'success' :
		$('#result_mesg').removeClass('alert-danger').removeClass('alert-info').addClass('alert-'+type);
		break;

	case 'danger' :
		$('#result_mesg').removeClass('alert-success').removeClass('alert-info').addClass('alert-'+type);
		break;

	case 'info' :
		$('#result_mesg').removeClass('alert-success').removeClass('alert-danger').addClass('alert-'+type);
		break;
	}
	$('#result_mesg').html(mesg);
}

displayObj = function(object){
	var output = '';
	for (var property in object) {
  		output += property + ': ' + object[property]+'; ';
	}
	return output;
}
