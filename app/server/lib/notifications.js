sendEmailNotification = function(ticketId) {
  var ticket = Tickets.findOne(ticketId);
  if(!ticket)
    throw new Meteor.Error("invalid-ticket-id");
  var queue = Queues.findOne(ticket.queueId);

  if(ticket.notify && ticket.notify.email) {
    Email.send({
      to: ticket.notify.email,
      from: "signmeup@cs.brown.edu",
      subject: "[SignMeUp] You're up next for " + ticket.course + " " + queue.name,
      text: "A TA chose to notify you about your spot. Head over to hours now."
    });

    Tickets.update(ticketId, {
      $push: {"notify.sent": "email"}
    });
  } else {
    throw new Meteor.Error("no-email-address");
  }
},

sendTextNotification = function(ticketId) {
  var ticket = Tickets.findOne(ticketId);
  if(!ticket)
    throw new Meteor.Error("invalid-ticket-id");
  var queue = Queues.findOne(ticket.queueId);

  if(ticket.notify && ticket.notify.phone && ticket.notify.carrier) {
    Email.send({
      to: ticket.notify.phone + "@" + ticket.notify.carrier,
      from: "signmeup@cs.brown.edu",
      text: "A TA notified you about your spot for " + ticket.course + " " + queue.name + ". Head over to hours now."
    });

    Tickets.update(ticketId, {
      $push: {"notify.sent": "text"}
    });
  } else {
    throw new Meteor.Error("invalid-phone-or-carrier");
  }
}
