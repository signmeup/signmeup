// Helper to calculate nextSignupTime for a user in a queue

// Calculate the next possible time that the given user can sign up for this
// queue. Usually they can re-signup instantly, but if a signupGap is set, they
// need to wait at least that long before signing up again.
_nextSignupTime = function(userId, queueId) {
  var queue = Queues.findOne(queueId);
  var tickets = _.map(queue.tickets, function(id) {
    // TODO: Issue is that not all tickets are published to client. Only
    // active tickets are.
    return Tickets.findOne(id);
  });

  var userTickets = _.filter(tickets, function(t) {
    return t.owner.id === userId;
  });

  // If no tickets by the user, return undefined.
  if (userTickets.length == 0)
    return undefined;

  var lastUsedTicket; // The last ticket that's open, missing, or done.
  for (var i = userTickets.length - 1; i >= 0; i--) {
    var ticket = userTickets[i];
    if (ticket.status !== "cancelled") {
      lastUsedTicket = ticket;
      break;
    }
  }

  // If only cancelled tickets exist, return undefined.
  if (typeof lastUsedTicket === "undefined") return undefined;

  // If an open / missing ticket exists, return undefined.
  if (_.contains(["open", "missing"], lastUsedTicket.status))
    return undefined;

  // Otherwise, calculate the next possible signup time.
  var signupGap = Courses.findOne({name: queue.course}).settings.signupGap || (10 * 60 * 1000);
  return lastUsedTicket.doneAt + signupGap;
}
