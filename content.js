$(document).ready(function() {
  init();
});

function init() {
  console.log('**Initializing WAST')
  if($('#pane-side').get(0) != null) {
    attachListener();
  }
  else {
    window.setTimeout(init,2000);
  }
}

var db;

function attachListener() {
  console.log('**WAST Loaded')

  if (window.indexedDB) {
      console.log("IndexedDB is supported");
  } else {
      console.log("Indexed DB is not supported!");
  }

  //Setup DB connection
  var dbPromise = indexedDB.open('wadel', 1);
  dbPromise.onupgradeneeded = function(event) {
    db = event.target.result;
    var messages = db.createObjectStore('messages',{autoIncrement: true});
    messages.createIndex("msgtext", "msgtext", { unique: true });
  }

  dbPromise.onsuccess = function(event) {
    db = event.target.result;
  }
  dbPromise.onerror = function(event) {
    console.log('error opening database ' + event.target.errorCode);
  }
  var target = $("#pane-side > div:nth-child(1) > div > div").get(0);

  // Create an observer instance
  var observer = new MutationObserver(onMutation);

  // Configuration of the observer
  var config = { characterData:true, characterDataOldValue:true, subtree: true };

  // Pass in the target node, as well as the observer options
  observer.observe(target, config);
}

function onMutation(mutations) {
    console.log('**Changes detected');
    printCurrentTime();
    console.log('Mutations count : ' + mutations.length);

    var message;
    mutations.forEach(function(item, i) {
      var changedTextNode = item.target;
      if(changedTextNode != null) {
        var changedText = changedTextNode.textContent;
        console.log('Mutation text['+i+']'+item.oldValue+'->'+changedText);
        if(changedText.includes("This message was deleted")) {
          message = item.oldValue;
          console.log('**Detected deleted message: ' + message);
          printCurrentTime();
          console.log("Printing offsetParent");
          console.log(item.target.parentNode.offsetParent.innerHTML);
        }
      }
    });

    if(db != null && message != null) {
        var tx = db.transaction(['messages'], 'readwrite');
        var store = tx.objectStore('messages');
        var item = {
            msgtext: new Date().toLocaleString()+ " " + message,
            created: new Date().getTime()
        };
        console.log('Attempting to store message: ' + message);
        store.add(item);
        tx.oncomplete = function() { console.log('Message stored!') }
        tx.onerror = function(event) {
          console.log('Error storing message! Ignored!! Msg: ' + message);
        }
    } else {
      //console.log('Either db or message null. Dont persist. Msg: '+message);
    }
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if(request.type == 'getMessages') {
      getAllMessages();
    }
    if(request.type == 'clearMessages') {
      var response = window.confirm('Are you sure you want to clear all deleted messages?');
      if(response == true) {
          clearAllMessages();
      }
    }

    sendResponse({greeting: "Work done"});
  }
);

function clearAllMessages() {
  //Setup DB connection
  var db;
  var dbPromise = indexedDB.open('wadel', 1);
  dbPromise.onupgradeneeded = function(event) {
    db = event.target.result;
  }
  dbPromise.onsuccess = function(event) {
    db = event.target.result;

    if(db != null) {
      var tx = db.transaction(['messages'], 'readwrite');
      var store = tx.objectStore('messages');
      var request = store.clear();

      request.onsuccess = function() {
        console.log('All Messages Cleared..');
      }
    }
  }
  dbPromise.onerror = function(event) {
    console.log('clearAllMessages:Error opening DB');
  }
}

function getAllMessages() {
  //Setup DB connection
  var db;
  var dbPromise = indexedDB.open('wadel', 1);
  dbPromise.onupgradeneeded = function(event) {
    db = event.target.result;
  }
  dbPromise.onsuccess = function(event) {
    db = event.target.result;

    if(db != null) {
      var tx = db.transaction(['messages'], 'readwrite');
      var store = tx.objectStore('messages');
      var request = store.getAll();

      request.onsuccess = function() {
        var data = request.result;
        var myWindow = window.open("DeletedMessages", "DeletedMessages", "width=500,height=500");
        myWindow.document.write("<html><link rel='stylesheet' href='w3.css'><body><div class='w3-container'><h2>Deleted Messages</h2><ul id='msgList' class='w3-ul w3-hoverable' style='overflow:scroll;height:90%'></ul></div></body></html>");
        myWindow.document.title = 'Whatsapp Read Deleted Extension';

        var list = myWindow.document.getElementById("msgList");
        data.reverse();
        for (index = 0; index < data.length; index++) {
            var listItem = document.createElement('li');
            listItem.innerHTML = data[index].msgtext;
            list.append(listItem);
        }
      }
    }
  }
  dbPromise.onerror = function(event) {
    console.log('getAllMessages:Error opening DB');
  }
}

function printCurrentTime() {
  var today = new Date();
  var h = today.getHours();
  var m = today.getMinutes();
  var s = today.getSeconds();
  console.log(h + ":" + m + ":" + s);
}
