var Vector = function(x,y,z)
{
	this.x = x;
	this.y = y;
	this.z = z;
};

var positions = [];
var staleStamps = [-1,-1,-1];

var settings = {timeoutValue:2000000,swipeDistance:200};
chrome.storage.sync.get(["timeoutValue","swipeDistance"],function(res)
{
	$.extend(settings,res.items);
});
chrome.storage.onChanged.addListener(function(changes, namespace) {
	if (namespace == "sync")
		for (key in changes) {
			var storageChange = changes[key];
			settings.key = storageChange.newValue;
		}
});

Leap.loop(function(frame)
{
	var hands = frame.hands;
	for (var i=0;i<hands.length;i++)
	{
		var h = hands[i];
		if (h.valid)
		{
			var location = new Vector(h.palmPosition[0],h.palmPosition[1],h.palmPosition[2]);
			var velocity = new Vector(h.palmVelocity[0],h.palmVelocity[1],h.palmVelocity[2]);
			
			positions.push(location);
			
			if (MaxAbsValue(velocity,"x") && velocity.x > 0 && PreviousPositionsContain(settings.swipeDistance,"x"))
            {
				if (staleStamps[0] == -1 || (staleStamps[0] != -1 && staleStamps[0] <= frame.timestamp - settings.timeoutValue))
				{
					console.log(settings);
					staleStamps[0] = frame.timestamp;
					chrome.windows.getCurrent({},function(window){
						if (window.focused)
							chrome.tabs.query({active:true,currentWindow:true},function(otabs){
								if (otabs.length > 0){
									var tab = otabs[0];
									chrome.tabs.query({currentWindow:true},function(tabs){
										for (var j = 0; j < tabs.length; j++) {
											if (tab.id == tabs[j].id)
												if (j+1 > tabs.length-1)
													chrome.tabs.update(tabs[0].id, {selected: true});
												else
													chrome.tabs.update(tabs[j+1].id, {selected: true});
										}
									});
								}
							});
					});
					RecognizedEvent();
				}
			}
			else if (MaxAbsValue(velocity, "x") && velocity.x < 0 && PreviousPositionsContain(settings.swipeDistance, "x"))
			{
				if (staleStamps[1] == -1 || (staleStamps[1] != -1 && staleStamps[1] <= frame.timestamp - settings.timeoutValue))
				{
					staleStamps[1] = frame.timestamp;
					chrome.windows.getCurrent({},function(window){
						if (window.focused)
						chrome.tabs.query({active:true,currentWindow:true},function(otabs){
							if (otabs.length > 0){
								var tab = otabs[0];
								chrome.tabs.query({currentWindow:true},function(tabs){
									for (var j = 0; j < tabs.length; j++) {
										if (tab.id == tabs[j].id)
											if (j-1 >= 0)
												chrome.tabs.update(tabs[j-1].id, {selected: true});
											else
												chrome.tabs.update(tabs[tabs.length-1].id, {selected: true});
									}
								});
							}
						});
					});
					RecognizedEvent();
				}
			}

			if (positions.length > 100)
				RecognizedEvent();
		}
	
	}


});

function MaxAbsValue(v,axis)
{
	switch (axis.toLowerCase())
	{
		case "x":
			return (Math.abs(v.x) > Math.abs(v.y) && Math.abs(v.x) > Math.abs(v.z)); 
		case "y":
			return (Math.abs(v.y) > Math.abs(v.x) && Math.abs(v.y) > Math.abs(v.z));
		case "z":
			return (Math.abs(v.z) > Math.abs(v.x) && Math.abs(v.z) > Math.abs(v.y));
	}
	return false;
}

function PreviousPositionsContain(distance,axis)
{
	if (positions.length == 0)
		return false;

	switch (axis.toLowerCase())
	{
		case "x":
			var lowestx = positions[0].x;
			var highestx = positions[0].x;
			for(var i=0;i<positions.length;i++)
			{
				var v = positions[i];
				if (v.x < lowestx)
					lowestx = v.x;
				if (v.x > highestx)
					highestx = v.x;
			}
			return ((((lowestx < 0) ? Math.abs(lowestx) : lowestx) + ((highestx < 0) ? Math.abs(highestx) : highestx)) > distance);
		case "y":
			var lowesty = positions[0].y;
			var highesty = positions[0].y;
			for(var i=0;i<positions.length;i++)
			{
				var v = positions[i];
				if (v.y < lowesty)
					lowesty = v.y;
				if (v.y > highesty)
					highesty = v.y;
			}
			return ((((lowesty < 0) ? Math.abs(lowesty) : lowesty) + ((highesty < 0) ? Math.abs(highesty) : highesty)) > distance);
		case "z":
			var lowestz = positions[0].z;
			var highestz = positions[0].z;
			for(var i=0;i<positions.length;i++)
			{
				var v = positions[i];
				if (v.z < lowestz)
					lowestz = v.z;
				if (v.z > highestz)
					highestz = v.z;
			}
			return ((((lowestz < 0) ? Math.abs(lowestz) : lowestz) + ((highestz < 0) ? Math.abs(highestz) : highestz)) > distance);
	}
	return false;
}

function RecognizedEvent()
{
	positions = [];
	positions.length = 0;
}