// communication with extension (Listening)
// https://developer.chrome.com/extensions/messaging
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
//    console.log(sender.tab ?
//                "from a content script:" + sender.tab.url :
//                "from the extension");
    if (request.greeting == "resultupdate") {                                   // Set Badge on results
        if (request.results == 0) {
            chrome.browserAction.setBadgeText({text: ""});
        }
        else {
            chrome.browserAction.setBadgeText({text: request.results});
        }
    }
  });