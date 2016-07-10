// Functions

_activeQueues = function() {
  return Queues.find({"status": {$nin: ["ended", "cancelled"]}}).fetch();
}

_activeTickets = function(ticketIds) {
  // Filter IDs and get tickets
  //
  // Note: can't do $in query because Mongo does not
  // guarantee an order for the response. See this bug
  // report for details: https://jira.mongodb.org/browse/SERVER-7528.
  var activeTicketIds = _filterActiveTicketIds(ticketIds);
  var activeTickets = _.map(activeTicketIds, function(id) {
    return Tickets.findOne(id);
  });

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

_filterActiveTicketIds = function(ticketIds) {
  return _.filter(ticketIds, function(id) {
    var ticket = Tickets.findOne(id);
    return (ticket && !(_.contains(["done", "cancelled"], Tickets.findOne(id).status)));
  });
}

// UI Helpers

if (Meteor.isClient) {
  UI.registerHelper("activeQueues", _activeQueues);
  UI.registerHelper("activeTickets", _activeTickets);
}
