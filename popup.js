// communication with extension (Sending)
// https://developer.chrome.com/extensions/messaging
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  chrome.tabs.sendMessage(tabs[0].id, {greeting: "initialization"}, function(response) {
      document.getElementById("messagecount").innerHTML = response.farewell;
      document.getElementById("updatetime").innerHTML = response.updatetime;
      document.getElementById('currenttime').innerHTML = Date();
      document.getElementById('SearchInterval').value = response.searchinterval;
      document.getElementById('CountdownRate').value = response.countdownrate;
      document.getElementById('updateperiod').innerHTML = (Date.parse(Date()) - Date.parse(response.updatetime))/1000/60;
  });
});


$(function() {
    document.getElementById("UpdateSearchInterval").addEventListener("click", function(){
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          var intervalvalue = document.getElementById('SearchInterval').value;
          chrome.tabs.sendMessage(tabs[0].id, {greeting: "UpdateSearchInterval", IntervalValue: intervalvalue}, function(response) {
              alert(response.intervalstatus);
          });
        });
    });
    document.getElementById("UpdateCoundownRate").addEventListener("click", function(){
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          var intervalvalue = document.getElementById('CountdownRate').value;
          chrome.tabs.sendMessage(tabs[0].id, {greeting: "UpdateCountdownRate", IntervalValue: intervalvalue}, function(response) {
              alert(response.intervalstatus);
          });
        });
    });
    document.getElementById("CheckSearchEmailFrom").addEventListener("click", function(){
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          var stringvalue = document.getElementById('SearchEmailFrom').value;
          chrome.tabs.sendMessage(tabs[0].id, {greeting: "CheckSearchEmailFrom", StringValue: stringvalue}, function(response) {
          });
        });
    });
    document.getElementById("CheckSubject").addEventListener("click", function(){
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          var stringvalue = document.getElementById('SearchSubject').value;
          chrome.tabs.sendMessage(tabs[0].id, {greeting: "CheckSubject", StringValue: stringvalue}, function(response) {
          });
        });
    });
    document.getElementById("CheckIssue").addEventListener("click", function(){
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          var stringvalue = document.getElementById('SearchIssue').value;
          chrome.tabs.sendMessage(tabs[0].id, {greeting: "CheckIssue", StringValue: stringvalue}, function(response) {
          });
        });
    });
});