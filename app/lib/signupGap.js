// Helper to calculate nextSignupTime for a user in a queue

// Calculate the next possible time that the given user can sign up for this
// queue. Usually they can re-signup instantly, but if a signupGap is set, they
// need to wait at least that long before signing up again.
_nextSignupTime = function(userId, queueId) {
  debugger;
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

  // If the user has an open ticket, return undefined.
  var lastTicket = userTickets[userTickets.length - 1];
  if (lastTicket.status === "open")
    return undefined;

  // Otherwise, calculate the next possible signup time.
  var signupGap = Courses.findOne(queue.course).settings.signupGap || 0;
  return lastTicket.endTime + signupGap;
}
