$(document).ready(function(){
  //TODO: Make sure these apis execute only once
  //Get PEER URL
  $.get('/getURL', function(url, status){
          //Get chaincodeID
          $.get('/chaincodeID', function(cc, status){
              //alert("Data: " + cc + "\nStatus: " + status);
              console.log('ChaincodeID received : '+cc)
              mainApp.chaincodeID = cc;
              localStorage.setItem("chaincodeHash", cc)
          });
          console.log('URL received : '+url);

          //Add endpoint to the URL
          mainApp.URL = url+'/chaincode';

          //Get userdetails
          $.get('/getEnrollId', function(userID, status){
                  console.log('Received UserID : '+userID);
                  //Add endpoint to the URL
                  mainApp.userID = userID;
                  $.get('/getEnrollSecret',function(pswd, status){
                    console.log('received secret');
                    mainApp.secret = pswd;
                    var payload = {
                      "enrollId": mainApp.userID,
                      "enrollSecret": mainApp.secret
                    }
                    $.ajax({
                       url : mainApp.URL.replace("chaincode", "registrar"),
                       type: "POST",
                       data : JSON.stringify(payload),
                       success: function(data, textStatus, jqXHR)
                       {
                                 console.log('############### User registrated ');
                                 mainApp.init();
                                 formApp.init();
  								//TODO: Change the polling time
  								//Polling time is set to 30 seconds
  								var closeAuctionsTimer = setInterval(function(){
    								tableApp.CloseAuctionsPoll();
  								}, 10000);
                                 tableApp.init();
                       },
                       error: function (jqXHR, textStatus, errorThrown)
                       {
                            console.log('############### User registartion Error !!!');
                       }
                    });
                  });
          });
  });
});
