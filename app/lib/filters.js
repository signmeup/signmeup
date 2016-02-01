// Functions

_activeQueues = function() {
  return Queues.find({"status": {$nin: ["ended", "cancelled"]}}).fetch();
}

_activeTickets = function(ticketIds) {
  // Get and filter tickets
  var allTickets = Tickets.find({_id: {$in: ticketIds}}).fetch();
  var activeTickets = _filterActiveTickets(allTickets);

  // Extend tickets with position
  for(var i = 0; i < activeTickets.length; i++) {
    activeTickets[i]["position"] = i + 1;
  }

  return activeTickets;
}

_filterActiveTickets = function(allTickets) {
  return _.filter(allTickets, function(t) {
    return !(_.contains(["done", "cancelled"], t.status));
  });
}

// UI Helpers

if (Meteor.isClient) {
  UI.registerHelper("activeQueues", _activeQueues);
  UI.registerHelper("activeTickets", _activeTickets);
}
