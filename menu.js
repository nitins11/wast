'use strict';

var _AnalyticsCode = 'put-GA-code-here';
var _gaq = _gaq || [];
_gaq.push(['_setAccount', _AnalyticsCode]);
_gaq.push(['_trackPageview']);
(function() {
  var ga = document.createElement('script');
  ga.type = 'text/javascript';
  ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(ga, s);
})();
function trackButtonClick(e) {
  _gaq.push(['_trackEvent', e.target.id, 'clicked']);
}
document.addEventListener('DOMContentLoaded', function () {
  var buttons = document.querySelectorAll('button');
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', trackButtonClick);
  }
});

let viewMessageBtn = document.getElementById('viewMessages');
viewMessageBtn.onclick = function(element) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {type:"getMessages"}, response => {
      if(chrome.runtime.lastError) {
          alert("Please switch to WhatsApp Tab or Reload WhatsApp-Web if already on WhatsApp Tab");
          window.close();
      } else {
        window.close();
      }
    });
  });
}

let clearMessageBtn = document.getElementById('clearMessages');
clearMessageBtn.onclick = function(element) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {type:"clearMessages"}, response => {
      if(chrome.runtime.lastError) {
          alert("Please switch to WhatsApp Tab or Reload WhatsApp-Web if already on WhatsApp Tab");
          window.close();
      } else {
        window.close();
      }
    });
  });
}
