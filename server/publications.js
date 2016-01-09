// Courses Publications

Meteor.publish("courses", function(name) {
  return Courses.find({});
});

Meteor.publish("course", function(name) {
  return Courses.find({name: name});
});


// Queues Publications

Meteor.publish("queue", function(id) {
  return Queues.find({_id: id});
});

Meteor.publish("activeQueues", function() {
  return Queues.find({"status": {$nin: ["done", "cancelled"]}});
});

// Users Publications

Meteor.publish("allUsers", function() {
  if(authorized.admin(this.userId)) {
    return Meteor.users.find({});
  }
});