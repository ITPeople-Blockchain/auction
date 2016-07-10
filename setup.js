/* global process */
/*******************************************************************************
 * Copyright (c) 2016 ITPeople Corporation.
 *
 * All rights reserved.
 *
 * Contributors:
 *   Ratnakar Asara - Initial implementation
 *******************************************************************************/
//Environments are either:
// 	1 - Bluemix Development
// 	2 - Localhost Development

var vcap_app = {application_uris: ['']};						//default blank
var ext_uri = '';
if(process.env.VCAP_APPLICATION){
	vcap_app = JSON.parse(process.env.VCAP_APPLICATION);
	for(var i in vcap_app.application_uris){
		if(vcap_app.application_uris[i].indexOf(vcap_app.name) >= 0){
			ext_uri = vcap_app.application_uris[i];
		}
	}
}

// 1. Bluemix Development
if(process.env.VCAP_APP_HOST){
		exports.SERVER = 	{
								HOST: process.env.VCAP_APP_HOST,
								PORT: process.env.VCAP_APP_PORT,
								DESCRIPTION: 'Bluemix - Development',
								EXTURI: ext_uri,
							 };
} else{ //2. Localhost - Development
	  exports.SERVER = 	{
							HOST:'localhost',
							PORT: 3000,
							DESCRIPTION: 'Localhost',
							EXTURI: 'localhost:5000',
						 };
}

exports.SERVER.vcap_app = vcap_app;
exports.DEBUG = vcap_app;
