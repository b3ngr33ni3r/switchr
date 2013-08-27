// Add event listeners once the DOM has fully loaded by listening for the
// `DOMContentLoaded` event on the document, and adding your listeners to
// specific elements when it triggers.
document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('save').addEventListener('click',storeValues);
  chrome.storage.sync.get(["timeoutValue","swipeDistance"],function(items){
	if (typeof(items) !== 'undefined'){
		if (typeof(items.timeoutValue) !== 'undefined')
		{
			updateIdToValue('timeoutValue',items.timeoutValue);
			updateIdToInnerHTML('curTimeout',items.timeoutValue);
		}
		if (typeof(items.swipeDistance) !== 'undefined')
		{
			updateIdToValue('swipeDistance',items.swipeDistance);
			updateIdToInnerHTML('curSwipeDistance',items.swipeDistance);	
		}
	}
  });
  chrome.storage.onChanged.addListener(function(changes, namespace) {
	if (namespace == "sync")
		for (key in changes) {
			var storageChange = changes[key];
			if (key == 'timeoutValue'){
				updateIdToValue('timeoutValue',storageChange.newValue);
				updateIdToInnerHTML('curTimeout',storageChange.newValue);
			}
			else if (key == 'swipeDistance'){
				updateIdToValue('swipeDistance',storageChange.newValue);
				updateIdToInnerHTML('curSwipeDistance',storageChange.newValue);
			}
		}
  });
});


 function updateIdToValue(id,value){
 	document.getElementById(id).value = value;
 }

 function updateIdToInnerHTML(id,innerHTML){
 	document.getElementById(id).innerHTML = innerHTML;
 }

 function storeValues(){
	 chrome.storage.sync.set({'timeoutValue': document.getElementById('timeoutValue').value,'swipeDistance': document.getElementById('swipeDistance').value}, function() {
		showNotification("Settings Saved");
	 });
 }
 
 function showNotification(message)
 {
	console.log(message);
 }
