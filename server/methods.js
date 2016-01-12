// TODO: Replace input error checks with check()

// Queue Methods

Meteor.methods({
  createQueue: function(course, name, location, endTime) {
    if(!Meteor.user())
      throw new Meteor.Error("no-user");
    if(!authorized.ta(Meteor.userId, course))
      throw new Meteor.Error("not-allowed");

    if(!Courses.find({name: course}).fetch())
      throw new Meteor.Error("invalid-course-name");

    var locationId;
    var locationObject = Locations.findOne({name: location});
    if(locationObject)
      locationId = locationObject._id;
    else
      locationId = Locations.insert({
        name: location
      });

    if(endTime <= Date.now())
      throw new Meteor.Error("invalid-end-time");

    var queue = {
      name: name,
      course: course,
      location: locationId,
      mode: "universal",

      status: "active",
      owner: {
        id: Meteor.userId,
        email: _getUserEmail(Meteor.userId)
      },

      startTime: Date.now(),
      endTime: endTime,
      averageWaitTime: 0,

      localSettings: {},
      announcements: [],
      tickets: []
    }

    var queueId = Queues.insert(queue);
    console.log("Created queue " + queueId);
  },

  shuffleQueue: function(queueId) {
    var queue = Queues.findOne({_id: queueId});
    if(!queue)
      throw new Meteor.Error("invalid-queue-id");

    if(!authorized.ta(Meteor.userId, queue.course))
      throw new Meteor.Error("not-allowed");

    var shuffledTickets = _.shuffle(queue.tickets);
    Queues.update({_id: queueId}, {
      $set: {tickets: shuffledTickets}
    });
    console.log("Shuffled tickets for " + queueId);
  }
});


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

  markTicketAsDone: function(ticketId) {
    var ticket = Tickets.findOne({_id: ticketId});
    if(!ticket)
      throw new Meteor.Error("invalid-ticket-id");

    if(authorized.ta(this.userId, ticket.course)) {
      Tickets.update({
        _id: ticketId
      }, {
        $set: {status: "done"}
      });
      console.log("Marked ticket " + ticketId + " as done");
    }
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