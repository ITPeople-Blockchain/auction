$(document).ready(function(){
  //TODO: How to disable localstorage for next session
  // Enable this for firsttime, and disable for subsequent runs
  //localStorage.setItem("chaincodeHash", '');
  mainApp.init();
  //TODO: Change the polling time
  //Polling time is set to 30 seconds
  var closeAuctionsTimer = setInterval(function(){
    tableApp.CloseAuctionsPoll();
  }, 30000);
});
