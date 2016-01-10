// Ticket Methods

Meteor.methods({
  addTicket: function(queueId, name, question, notify) {
    var user = Meteor.user();
    if(!user)
      throw new Meteor.Error("no-user");

    var queue = Queues.findOne({_id: queueId});
    if (!queue)
      throw new Meteor.Error("invalid-queue-id");
    if (!name || name.length <= 3)
      throw new Meteor.Error("invalid-name");
    if (!question || question.length <= 3) 
      // TODO: Handle optional question case
      throw new Meteor.Error("invalid-question");
    // TODO: Validate notify object

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

  cancelTicket: function(ticketId) {
    var ticket = Tickets.findOne({_id: ticketId});
    if(!ticket)
      throw new Meteor.Error("invalid-ticket-id");

    if(authorized.ta(this.userId, ticket.course) || this.userId === ticket.owner.id) {
      Tickets.update({
        _id: ticketId
      }, {
        $set: {status: "cancelled"}
      });
    }
  }
});