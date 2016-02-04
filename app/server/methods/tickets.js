// Ticket Methods

// TODO: Replace input error checks with check()
// TODO: Replace "not-allowed" errors with 403 errors

Meteor.methods({
  addTicket: function(queueId, name, question, notify) {
    var user = Meteor.user();
    if(!user)
      throw new Meteor.Error("no-user");

    var queue = Queues.findOne({_id: queueId});
    if (!queue)
      throw new Meteor.Error("invalid-queue-id");
    if (queue.status === "ended")
      throw new Meteor.Error("queue-ended");
    if (!name)
      throw new Meteor.Error("invalid-name");
    if (!question) 
      // TODO: Handle optional question case
      throw new Meteor.Error("invalid-question");
    // TODO: Validate notify object
    
    // Disable signing up again if an active ticket exists
    var activeTicketIds = _filterActiveTicketIds(queue.tickets);
    _.each(activeTicketIds, function(id) {
      var ticket = Tickets.findOne(id);
      if (ticket.owner.id === Meteor.userId())
        throw new Meteor.Error("already-signed-up");
    });

    var ticket = {
      createdAt: Date.now(),
      queueId: queueId,
      course: queue.course,
      owner: {
        id: user._id,
        name: name
      },
      status: "open",

      question: question,
      notify: notify,

      ta: {},
      flag: {}
    }

    var ticketId = Tickets.insert(ticket);
    Queues.update({_id: queueId}, {$push: {tickets: ticketId}});
    console.log("Inserted ticket " + ticketId + " to queue " + queueId);
  },

  notifyTicketOwner: function(ticketId, type) {
    console.log(ticketId, type);
    var ticket = Tickets.findOne(ticketId);
    if(!ticket) throw new Meteor.Error("invalid-ticket-id");

    if (!authorized.ta(this.userId, ticket.course))
      throw new Meteor.Error("not-allowed");

    if (ticket.notify && ticket.notify.types && _.contains(ticket.notify.types, type)) {
      this.unblock();
      
      if (type === "email") {
        sendEmailNotification(ticketId);
      } else if (type === "text") {
        sendTextNotification(ticketId);
      }
    }
  },

  markTicketAsDone: function(ticketId) {
    var ticket = Tickets.findOne({_id: ticketId});
    if(!ticket)
      throw new Meteor.Error("invalid-ticket-id");
    if(!authorized.ta(this.userId, ticket.course))
      throw new Meteor.Error("not-allowed");

    Tickets.update({
      _id: ticketId
    }, {
      $set: {status: "done", doneAt: Date.now()}
    });

    updateWaitTime(ticketId);
    console.log("Marked ticket " + ticketId + " as done");
  },

  cancelTicket: function(ticketId) {
    var ticket = Tickets.findOne({_id: ticketId});
    if(!ticket)
      throw new Meteor.Error("invalid-ticket-id");

    if(authorized.ta(this.userId, ticket.course) || this.userId === ticket.owner.id) {
      Tickets.update({
        _id: ticketId
      }, {
        $set: {status: "cancelled", cancelledAt: Date.now()}
      });
    }
  }
});