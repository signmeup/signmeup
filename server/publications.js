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
    var isTA = authorized.ta(this.userId, queue.course);

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

  var isTA = authorized.ta(this.userId, queue.course);

  return Tickets.find({
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
  if(authorized.admin(this.userId)) {
    return Meteor.users.find({});
  }
});