define(function()
{
var eventsList = {};

return {
	registerEv: function(eventType, action)
	{
		if(!(eventType in eventsList))
			eventsList[eventType] = [action]
		else 
			eventsList[eventType].push(action);
	},
	emit: function(evType, ev)
	{
		for(e in eventsList[evType])
			eventsList[evType][e](ev);
	},
}
});

