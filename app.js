'use strict';
var express = require('express');
var path = require('path');
var app = express();
var http = require('http');
var url = require('url');
var setup = require('./setup');
var fs = require("fs");

//// Set Server Parameters ////
var host = setup.SERVER.HOST;
var port = setup.SERVER.PORT;

var cors = require('cors');
// Enable CORS preflight across the board.
app.options('*', cors());
app.use(cors());

app.use(express.static('public'));
var server = http.createServer(app).listen(port, function() {});

//server.timeout = 240000;
console.log('####################### Server Up - ' + host + ':' + port + ' #######################');

var Ibc1 = require('ibm-blockchain-js');
var ibc = new Ibc1();
var chaincode = {};
var peers, users;
try{
	var manual = JSON.parse(fs.readFileSync('credentials.json', 'utf8'));
	var peers = manual.credentials.peers;
	console.log('loading hardcoded peers');
	var users = null;																		//users are only found if security is on
	if(manual.credentials.users) users = manual.credentials.users;
	console.log('loading hardcoded users');
}
catch(e){
	console.log('Error - could not find hardcoded peers/users, this is okay if running in bluemix');
}
    if(process.env.VCAP_SERVICES){															//load from vcap, search for service, 1 of the 3 should be found...
      console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ load from vcap, search for service, 1 of the 3 should be found...  ');

    	var servicesObject = JSON.parse(process.env.VCAP_SERVICES);
      console.log('#######################', servicesObject);
    	for(var i in servicesObject){
    		if(i.indexOf('ibm-blockchain') >= 0){											//looks close enough
    			if(servicesObject[i][0].credentials.error){
    				console.log('!\n!\n! Error from Bluemix: \n', servicesObject[i][0].credentials.error, '!\n!\n');
    				peers = null;
    				users = null;
    				process.error = {type: 'network', msg: 'Due to overwhelming demand the IBM Blockchain Network service is at maximum capacity.  Please try recreating this service at a later date.'};
    			}
    			if(servicesObject[i][0].credentials && servicesObject[i][0].credentials.peers){
    				console.log('overwritting peers, loading from a vcap service: ', i);
    				peers = servicesObject[i][0].credentials.peers;
    				if(servicesObject[i][0].credentials.users){
    					console.log('overwritting users, loading from a vcap service: ', i);
    					users = servicesObject[i][0].credentials.users;
              console.log(users);
    				}
    				else users = null;														//no security
    				break;
    			}
    		} else {
          console.log('####################### In Else condition');
          console.log(i);
          console.log('#######################');
        }
    	}
    }

    var options =   {
            network:{
                peers:  peers,
                users:  users,
                options: {quiet: true, tls:false, maxRetry: 1}
            },
            chaincode:{
                zip_url: 'https://github.com/ITPeople-Blockchain/auction/archive/master.zip',
                unzip_dir: 'auction-master/art/artchaincode',
                git_url: 'https://github.com/ITPeople-Blockchain/auction/art/artchaincode'
            }
        };
        if(process.env.VCAP_SERVICES){
        	console.log('\n[!] looks like you are in bluemix, clear out the deploy_name so that it deploys new cc [!]');
        	options.chaincode.deployed_name = '';
        }
        ibc.load(options, cb_ready);

        var chaincode = null;
function cb_ready(err, cc){																	//response has chaincode functions
	if(err != null){
		console.log('! looks like an error loading the chaincode or network, app will fail\n', err);
		if(!process.error) process.error = {type: 'load', msg: err.details};				//if it already exist, keep the last error
	}
	else{
		chaincode = cc;
		if(!cc.details.deployed_name || cc.details.deployed_name === ''){					//decide if i need to deploy
      console.log("############## DEPLOYING CHAINCODE ###########")
			cc.deploy('init', ['INITIALIZE'], null, cb_deployed);
		}
		else{
			console.log('chaincode summary file indicates chaincode has been previously deployed');
			cb_deployed();
		}
	}
}
app.get('/chaincodeID', function(req, res){
  if (chaincode.details.deployed_name && chaincode.details.deployed_name !== ''){
    res.send(chaincode.details.deployed_name);
  } else { //TODO: handle this case
    res.send('');
  }
});
app.get('/getURL', function(req, res){
  console.log('Request for URL received')
  if (peers){
    console.log('Send URL as response ...');
    var url = 'https://'+peers[0].api_host + ':' +peers[0].api_port_tls;
    console.log('URL : '+url);
    res.send(url);
  } else {//TODO: handle this case
    res.send('');
  }
});
app.get('/getEnrollId', function(req, res){
  console.log('Request for UserName received')
  if (users){
    console.log('Send enrollId as response ...');
    var enrollId = users[0].enrollId;
    console.log('enrollId : '+enrollId);
    res.send(enrollId);
  } else {//TODO: handle this case
    res.send('');
  }
});
app.get('/getEnrollSecret', function(req, res){
  console.log('Request for secret received')
  if (users){
    console.log('Send enrollSecret as response ...');
    var enrollSecret = users[0].enrollSecret;
    console.log('enrollSecret : '+enrollSecret);
    res.send(enrollSecret);
  } else {//TODO: handle this case
    res.send('');
  }
});

function cb_deployed(err){
       console.log('sdk has deployed code and waited');
       console.log("----------------------------------------");
       console.log("-------------------- chaincode -------------------- ");
       console.log(chaincode);
       console.log("-------------------- chaincode.details -------------------- ");
       console.log(chaincode.details);
       console.log("-------------------- chaincode.details.deployed_name -------------------- ")
       console.log("["+chaincode.details.deployed_name+"]");
       console.log("----------------------------------------");
       exports.chaincodeid = chaincode.details.deployed_name;
       exports.Chaincode = 	{
   							ID:chaincode.details.deployed_name
   		 };
   }
