// Waiting Time Calcuator
// 
// For now, just a running average of the time spent
// between creating a ticket to it being marked as done.
// 
// In the future, use the Waiting Time formula
// from queueing theory as detailed here:
// https://www.utdallas.edu/~metin/Or6302/Folios/omqueue.pdf.

updateWaitTime = function(lastTicketId) {
  var ticket = Tickets.findOne(lastTicketId);
  var queue = Queues.findOne(ticket.queueId);

  var newAverage = _calculateWaitTime(ticket, queue);

  Queues.update(ticket.queueId, {
    $set: {averageWaitTime: newAverage}
  });
}

function _calculateWaitTime(ticket, queue) {
  var allTickets = Tickets.find({
    _id: {$in: queue.tickets}
  }).fetch();

  var completedTickets = _.filter(allTickets, function(t) {
    return t.status === "done";
  });

  var averageTimeSoFar = queue.averageWaitTime;
  var totalWaitTime = averageTimeSoFar * completedTickets.length;

  var ticketWaitTime = ticket.doneAt - ticket.createdAt;
  var newAverage = Math.floor((totalWaitTime + ticketWaitTime) / (completedTickets.length + 1));

  return newAverage;
}