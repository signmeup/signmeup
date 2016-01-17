// Courses Publications

Meteor.publish("courses", function(name) {
  return Courses.find({});
});

Meteor.publish("course", function(name) {
  return Courses.find({name: name});
});


// Locations Publications

Meteor.publish("locations", function() {
  return Locations.find({});
});


// Queues Publications

Meteor.publish("queue", function(queueId) {
  return Queues.find({_id: queueId});
});

Meteor.publish("activeQueues", function() {
  return Queues.find({"status": {$nin: ["done", "cancelled"]}});
});

// Tickets Publications

Meteor.publish("allActiveTickets", function() {
  var activeQueues = Queues.find({"status": {$nin: ["done", "cancelled"]}}).fetch();
  var activeTickets = [];

  _.each(activeQueues, function(queue) {
    var queueId = queue._id;
    var isTA = false;
    if(this.userId)
      isTA = authorized.ta(this.userId, queue.course);

    var tickets = Tickets.find({
      queueId: queueId,
      status: {$in: ["open", "missing"]}
    }, {
      fields: {
        question: isTA,
        notify: isTA,
        ta: isTA,
        flag: isTA
      }
    });

    activeTickets.push(tickets);
  });

  return activeTickets;
});

Meteor.publish("activeTickets", function(queueId) {
  var queue = Queues.findOne({_id: queueId});
  if(!queue) return;

  // Hide fields for non-TAs
  var projection = {};

  var isTA = false;
  if(this.userId) {
    isTA = authorized.ta(this.userId, queue.course);
  }

  if(!isTA) {
    projection["fields"] = {
      question: false,
      notify: false,
      ta: false,
      flag: false
    }
  }

  return Tickets.find({
    queueId: queueId,
    status: {$in: ["open", "missing"]}
  }, projection);
});


// Users Publications

Meteor.publish("userData", function() {
  if(this.userId) {
    return Meteor.users.find({
      _id: this.userId
    }, {
      email: true,
      admin: true,
      htaCourses: true,
      taCourses: true
    });
  }
});

Meteor.publish("allUsers", function() {
  if(!this.userId)
    throw new Meteor.Error("no-user");

  if(!authorized.admin(this.userId))
    throw new Meteor.Error("not-allowed");

  return Meteor.users.find({});
});