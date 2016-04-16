// Queue Methods

// TODO: Replace input error checks with check()
// TODO: Replace "not-allowed" errors with 403 errors

Meteor.methods({
  createQueue: function(course, name, location, endTime, ownerId) {
    var clientCall = !!(this.connection);
    if(clientCall && !authorized.ta(Meteor.userId, course))
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

    if(clientCall) {
      ownerId = Meteor.userId();
    }

    // Create queue
    var queue = {
      name: name,
      course: course,
      location: locationId,

      status: "active",
      owner: {
        id: ownerId,
        email: _getUserEmail(ownerId)
      },

      startTime: Date.now(),
      endTime: endTime,
      averageWaitTime: 0,

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

  updateQueue: function(queueId, name, location, endTime) {
    var queue = Queues.findOne({_id: queueId});
    if(!queue)
      throw new Meteor.Error("invalid-queue-id");
    if(!authorized.ta(Meteor.userId, queue.course))
      throw new Meteor.Error("not-allowed");

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

    Queues.update(queueId, {
      $set: {
        name: name,
        location: locationId,
        endTime: endTime
      }
    });

    // Remove old cron job, create new one
    SyncedCron.remove(queueId + "-ender");
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

    var activeTicketIds = _filterActiveTicketIds(queue.tickets);
    var startingIndex = queue.tickets.indexOf(activeTicketIds[0]);
    var newTickets = queue.tickets.slice(0, startingIndex).concat(_.shuffle(activeTicketIds));

    Queues.update({_id: queueId}, {
      $set: {tickets: newTickets}
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

    // TODO: Cancel active tickets?

    SyncedCron.remove(queueId + "-ender");

    Queues.update(queueId, {
      $set: {
        status: "ended",
        endTime: Date.now()
      }
    });
  }
});
