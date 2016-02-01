// Queue Methods

// TODO: Replace input error checks with check()
// TODO: Replace "not-allowed" errors with 403 errors

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

    // Create queue
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

    // Create ender cron job
    console.log("Creating cron job");
    SyncedCron.add({
      name: queueId + "-ender",
      schedule: function(parser) {
        var date = new Date(endTime);
        return parser.recur().on(date).fullDate();
      },
      job: function() {
        var queueId = this.name.split("-")[0];
        Meteor.call("endQueue", queueId);
      }
    });
  },

  clearQueue: function(queueId) {
    var queue = Queues.findOne({_id: queueId});
    if(!queue)
      throw new Meteor.Error("invalid-queue-id");

    if(queue.status === "ended")
      throw new Meteor.Error("queue-ended")

    if(!authorized.ta(Meteor.userId, queue.course))
      throw new Meteor.Error("not-allowed");

    var activeTicketIds = _.map(_activeTickets(queue.tickets), function(t) {
      return t._id;
    });

    console.log(activeTicketIds);

    Tickets.update({_id: {$in: activeTicketIds}}, {
      $set: {status: "cancelled"}
    });
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
    var activeTicketIds = _.map(_activeTickets(queue.tickets), function(t) {
      return t._id;
    });
    var startingIndex = queue.tickets.indexOf(activeTicketIds[0]);
    
    var shuffledTickets = _.shuffle(queue.tickets);
    Queues.update({_id: queueId}, {
      $set: {tickets: shuffledTickets}
    });
    console.log("Shuffled tickets for " + queueId);
  },

  activateQueue: function(queueId) {
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

  cutoffQueue: function(queueId) {
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

  endQueue: function(queueId) {
    var queue = Queues.findOne({_id: queueId});
    if(!queue)
      throw new Meteor.Error("invalid-queue-id");

    var clientCall = !!(this.connection);
    if(clientCall && !authorized.ta(Meteor.userId, queue.course))
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