// TODO: Replace input error checks with check()
// TODO: Replace "not-allowed" errors with 403 errors

// Courses Methods

Meteor.methods({
  updateCourse: function(course, options) {
    // Update name, description, listserv, or active
    if(!authorized.admin(Meteor.userId))
      throw new Meteor.Error("not-allowed");

    var validFields = ["name", "description", "listserv", "active"];
    _.each(validFields, function(field) {
      if(options[field]) {
        var setObject = {};
        setObject[field] = options[field];

        Courses.update({name: course}, {
          $set: setObject
        });
      }
    });
  },

  addTA: function(course, email) {
    if(!authorized.admin(Meteor.userId))
      throw new Meteor.Error("not-allowed");

    var userId;
    var user = _getUserFromEmail(email);
    if(user) {
      // Find the TA
      userId = user._id;
    } else {
      // Or, create a new user for the TA
      userId = Meteor.users.insert({
        email: email,
      });
    }

    if (authorized.ta(userId, course))
      throw new Meteor.Error("already-a-ta");

    // Update the course
    Courses.update({name: course}, {
      $push: {tas: userId}
    });

    // Update the user
    Meteor.users.update(userId, {
      $push: {taCourses: course}
    });
  },

  deleteTA: function(course, userId) {
    if(!authorized.admin(Meteor.userId))
      throw new Meteor.Error("not-allowed");

    Courses.update({name: course}, {
      $pull: {tas: userId, htas: userId}
    });

    Meteor.users.update(userId, {
      $pull: {taCourses: course, htaCourses: course}
    });
  },

  switchToTA: function(course, userId) {
    if(!authorized.admin(Meteor.userId))
      throw new Meteor.Error("not-allowed");

    Courses.update({name: course}, {
      $pull: {htas: userId},
      $push: {tas: userId}
    });

    Meteor.users.update(userId, {
      $pull: {htaCourses: course},
      $push: {taCourses: course}
    });
  },

  switchToHTA: function(course, userId) {
    if(!authorized.admin(Meteor.userId))
      throw new Meteor.Error("not-allowed");

    Courses.update({name: course}, {
      $pull: {tas: userId},
      $push: {htas: userId}
    });

    Meteor.users.update(userId, {
      $pull: {taCourses: course},
      $push: {htaCourses: course}
    });
  },

  deleteCourse: function(course) {
    if(!authorized.admin(Meteor.userId))
      throw new Meteor.Error("not-allowed");

    var course = Courses.findOne({name: course});
    if(!course)
      throw new Meteor.Error("invalid-course-name");

    var htas = course.htas;
    var tas = course.tas;

    _.each(htas, function(hta) {
      Meteor.users.update(hta, {
        $pull: {htaCourses: course.name}
      });
    });

    _.each(tas, function(ta) {
      Meteor.users.update(ta, {
        $pull: {taCourses: course.name}
      });
    });

    Courses.remove(course._id);
  }
});


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

    if(queue.status === "ended")
      throw new Meteor.Error("queue-ended")

    if(!authorized.ta(Meteor.userId, queue.course))
      throw new Meteor.Error("not-allowed");

    // TODO: Shuffle only active tickets
    var shuffledTickets = _.shuffle(queue.tickets);
    Queues.update({_id: queueId}, {
      $set: {tickets: shuffledTickets}
    });
    console.log("Shuffled tickets for " + queueId);
  },

  "activateQueue": function(queueId) {
    // Make a cutoff queue active again
    var queue = Queues.findOne({_id: queueId});
    if(!queue)
      throw new Meteor.Error("invalid-queue-id");

    if(queue.status === "ended")
      throw new Meteor.Error("queue-ended")

    if(!authorized.ta(Meteor.userId, queue.course))
      throw new Meteor.Error("not-allowed");

    Queues.update(queueId, {
      $set: {status: "active"},
      $unset: {cutoffTime: ""}
    });
  },

  "cutoffQueue": function(queueId) {
    var queue = Queues.findOne({_id: queueId});
    if(!queue)
      throw new Meteor.Error("invalid-queue-id");

    if(queue.status === "ended")
      throw new Meteor.Error("queue-ended")

    if(!authorized.ta(Meteor.userId, queue.course))
      throw new Meteor.Error("not-allowed");

    console.log("Cutting off " + queueId);

    Queues.update(queueId, {
      $set: {
        status: "cutoff",
        cutoffTime: Date.now()
      }
    });
  },

  "endQueue": function(queueId) {
    var queue = Queues.findOne({_id: queueId});
    if(!queue)
      throw new Meteor.Error("invalid-queue-id");

    if(!authorized.ta(Meteor.userId, queue.course))
      throw new Meteor.Error("not-allowed");

    console.log("Ending queue " + queueId);

    // TODO: Cancel active tickets
    // TODO: Cancel the queue-ender cron job

    Queues.update(queueId, {
      $set: {
        status: "ended",
        endTime: Date.now()
      }
    });
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
    if (queue.status === "ended")
      throw new Meteor.Error("queue-ended");
    if (!name)
      throw new Meteor.Error("invalid-name");
    if (!question) 
      // TODO: Handle optional question case
      throw new Meteor.Error("invalid-question");
    // TODO: Validate notify object
    
    // TODO: Disable adding when user already has ticket

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
        $set: {status: "cancelled", cancelledAt: Date.now()}
      });
    }
  }
});