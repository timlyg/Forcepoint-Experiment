setTimeout(ClickLogOn, 5000);
setTimeout(KillOldSessionClick, 1000);

document.getElementById("Originator").value = "*";
document.getElementById("Recipient").value = "*";
document.getElementById("Disposition").value = "quarantined";
document.getElementById("StartDateOptions").value = "week";
document.getElementById("DisplayLimit").value = "200";

var loopMins = 10;          // this is the default value for search interval in mins
var countdownSecs = 60;     // this is the default value for Title Countdown rate in secs.

document.title = " MC: ";

// Initial run, only once.
setTimeout(ClickSearch, 1000);
setTimeout(TitleCountdown, 2000);

var updatetime = Date();

// Intervals set with ID, so that they can be stopped by clearInterval(ID)
var SearchIntervalID = setInterval(ClickSearch, loopMins * 60 * 1000);
var CountdownRateID = setInterval(TitleCountdown, countdownSecs * 1000);

function ClickSearch () {
    document.getElementsByName("search")[0].click();
    window.updatetime = Date();
}

function KillOldSessionClick () {
    document.getElementById("kill_old_sessions_yes").click();
}

function ClickLogOn () {
    // Chrome not able to take autofilled password fill in javascript form submit. Could be a security measure.
    // this matter was discussed in https://stackoverflow.com/questions/35049555/chrome-autofill-autocomplete-no-value-for-password/46433610#46433610
//    document.getElementById("login_username").value = "your@email.com";
//    document.getElementById("login_password").value = "yourpassword";
//    document.querySelector("#login_form [type='submit']:not([disabled])").click();
}


function TitleCountdown () {
    var count = loopMins - ((Date.parse(Date()) - Date.parse(window.updatetime))/1000/60).toFixed(2);           // get only 2 decimal places
    count = count.toString().replace(/(\.\d{2})\d*/,'$1');                                                      // ensure 2 decimal places - in case toFixed(2) failed due to floating point manipulation.
    document.title = document.title.substr(0, document.title.indexOf('MC:')+3) + ' ' + count;
}

// select the target node
var target_results = document.getElementById("totalNumberResults");
var target_theaction = document.getElementById("theaction");
 
// create an observer instance - Detects change in totalNumberResults then send updates
// DOM listerner: https://stackoverflow.com/questions/2844565/is-there-a-javascript-jquery-dom-change-listener/11546242#11546242
var observer_results = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
      //console.log(mutation.type);
      // communication with extension (sending)
      var totalresult = document.getElementById("totalNumberResults").innerHTML;
      document.title = totalresult + ' ' + document.title.substr(document.title.indexOf('MC:'));
      chrome.runtime.sendMessage({greeting: "resultupdate", results: totalresult});
  });
});

// create an observer instance - Detects theaction tag, then ensure it's set to "deleted"
// DOM listerner: https://stackoverflow.com/questions/2844565/is-there-a-javascript-jquery-dom-change-listener/11546242#11546242
var observer_theaction = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
      //console.log(mutation.type);
      document.getElementById("theaction").value = "deleted";
  });
});


// Next project: Scan the table of results and auto select obvious spams: '=' in email addr, same emails to multiple, etc.
// using MutationObserver, I believe



// configuration of the observer:
var config = { attributes: true, childList: true, characterData: true };
 
// pass in the target node, as well as the observer options
observer_results.observe(target_results, config);
observer_theaction.observe(target_theaction, config);
 
// later, you can stop observing
//observer_results.disconnect();


// communication with extension (Listening) - Update Results
// https://developer.chrome.com/extensions/messaging
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
      var totalresult = document.getElementById("totalNumberResults").innerHTML;
    if (request.greeting == "initialization") {                                                                                     // Initialize fields
        sendResponse({farewell: (totalresult? totalresult : "Nothing"), updatetime: window.updatetime, searchinterval: loopMins, countdownrate: countdownSecs});
    }
    else if (request.greeting == "UpdateSearchInterval") {                                                                          // Update Search Interval
        loopMins = request.IntervalValue;
        clearInterval(SearchIntervalID);
        SearchIntervalID = setInterval(ClickSearch, loopMins * 60 * 1000);
        sendResponse({intervalstatus: "Search interval is set to " + loopMins + " min(s)"});
    }
    else if (request.greeting == "UpdateCountdownRate") {                                                                           // Update Title Countdown Rate
        countdownSecs = request.IntervalValue;
        clearInterval(CountdownRateID);
        CountdownRateID = setInterval(TitleCountdown, countdownSecs * 1000);
        sendResponse({intervalstatus: "Countdown interval is set to " + countdownSecs + " sec(s)"});
    }
    else if (request.greeting == "CheckSearchEmailFrom") {                                                                           // Checks all that match Sender Email addresses
        stringvalue = request.StringValue;
        selected = 0;
        notselected = 0;            // some selection may have already been deleted.
        ListOfChecks = document.querySelectorAll("span[oldtitle*='" + stringvalue + "' i]");                // ^= means begins with; $= means ends with; *= means contains. i means ignore case sensitivity.
        for (i=0; i<ListOfChecks.length; i++) {
            try {
                ListOfChecks[i].parentElement.parentElement.querySelector("input[type='checkbox']").click();
                selected++;
            }
            catch(error) {
                notselected++;
            }
        }
        alert(selected + " selected, " + notselected + " not selected.");
    }
    else if (request.greeting == "CheckSubject") {                                                                           // Checks all that match subjects
        stringvalue = request.StringValue;

        jQuery.expr[':'].Contains = function(a,i,m){                                    // this creates a case-insensitive version of JQUERY :contains
            return jQuery(a).text().toUpperCase().indexOf(m[3].toUpperCase())>=0;       // reference: https://stackoverflow.com/questions/187537/is-there-a-case-insensitive-jquery-contains-selector
        };        
        selected = 0;
        notselected = 0;            // some selection may have already been deleted.
        ListOfChecks = $("div[id*='_subject']:Contains('" + stringvalue + "')");
        for (i=0; i<ListOfChecks.length; i++) {
            try {
                ListOfChecks[i].parentElement.parentElement.parentElement.querySelector("input[type='checkbox']").click();
                selected++;
            }
            catch(error) {
                notselected++;
            }
        }
        alert(selected + " selected, " + notselected + " not selected.");
    }
    else if (request.greeting == "CheckIssue") {                                                                           // Checks all that match Issues
        stringvalue = request.StringValue;

        jQuery.expr[':'].Contains = function(a,i,m){                                    // this creates a case-insensitive version of JQUERY :contains
            return jQuery(a).text().toUpperCase().indexOf(m[3].toUpperCase())>=0;       // reference: https://stackoverflow.com/questions/187537/is-there-a-case-insensitive-jquery-contains-selector
        };        
        
        ListOfChecks = $("span[id*='_issue']:Contains('" + stringvalue + "')");
        selected = 0;
        notselected = 0;            // some selection may have already been deleted.
        for (i=0; i<ListOfChecks.length; i++) {
            try {
                ListOfChecks[i].parentElement.parentElement.querySelector("input[type='checkbox']").click();
                selected++;
            }
            catch(error) {
                notselected++;
            }
        }
        alert(selected + " selected, " + notselected + " not selected.");
    }
  });
