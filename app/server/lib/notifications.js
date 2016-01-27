Meteor.methods({
  sendEmailNotification: function(ticketId) {
    var ticket = Tickets.findOne(ticketId);
    if(!ticket)
      throw new Meteor.Error("invalid-ticket-id");
    var queue = Queues.findOne(ticket.queueId);

    if(ticket.notify && ticket.notify.email) {
      this.unblock();

      Email.send({
        to: ticket.notify.email,
        from: "signmeup@cs.brown.edu",
        subject: "[SignMeUp] You're up next for " + ticket.course + " " + queue.name,
        text: "A TA chose to notify you about your spot. Head over to hours now."
      });
    } else {
      throw new Meteor.Error("no-email-address");
    }
  },

  sendTextNotification: function(ticketId) {
    var ticket = Tickets.findOne(ticketId);
    if(!ticket)
      throw new Meteor.Error("invalid-ticket-id");
    var queue = Queues.findOne(ticket.queueId);

    if(ticket.notify && ticket.notify.phone) {
      this.unblock();
      
      // carrierEmails is loaded up in a separate JS file.
      var carrierEmail = carrierEmails[ticket.notify.carrier];

      Email.send({
        to: ticket.notify.phone + "@" + carrierEmail,
        from: "signmeup@cs.brown.edu",
        text: "A TA notified you about your spot for " + ticket.course + " " + queue.name + ". Head over to hours now."
      });
    } else {
      throw new Meteor.Error("no-phone-number");
    }
  }
});