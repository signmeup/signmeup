// Functions

_activeQueues = function() {
  return Queues.find({"status": {$nin: ["done", "cancelled"]}}).fetch();
}

_activeTickets = function(ticketIds) {
  // Get and filter tickets
  var allTickets = Tickets.find({_id: {$in: ticketIds}}).fetch();
  var activeTickets = _filterActiveTickets(allTickets);

  // Extend tickets with position and waiting time
  for(var i = 0; i < activeTickets.length; i++) {
    activeTickets[i]["position"] = i + 1;
    activeTickets[i]["waitTime"] = (i + 1) * _timeInMinutes(this.averageWaitTime);
  }

  return activeTickets;
}

_filterActiveTickets = function (allTickets) {
  return _.filter(allTickets, function(e) {
    return (["done", "expired", "cancelled"].indexOf(e.status) == -1);
  });
}

_timeInMinutes = function (milliseconds) {
  var d = moment.duration(milliseconds, "milliseconds");
  return Math.floor(d.asMinutes());
}

_getUserEmail = function() {
  if (Meteor.user()) {
    var user = Meteor.user();
    if (user.email) {
      return user.email
    } else if (user.emails) {
      return user.emails[0].address;
    } else if (user.profile.email) {
      return user.profile.email;
    } else {
      return null;
    }
  } else {
    return null;
  }
}

_getUserName = function() {
  if(Meteor.user()) {
    var p = Meteor.user().profile;
    var emailName = _getUserEmail().split("@")[0];
    return (p.displayName || p.name) || emailName;
  } else {
    return null;
  }
}

// UI Helpers

UI.registerHelper("activeQueues", _activeQueues);
UI.registerHelper("activeTickets", _activeTickets);
UI.registerHelper("userName", _getUserName);
UI.registerHelper("userEmail", _getUserEmail);
