/**
 * Courses Publications
 */
Meteor.publish("courses", function(name) {
  return Courses.find({});
});

Meteor.publish("course", function(name) {
  return Courses.find({name: name});
});

/**
 * Queues Publiciations
 */
Meteor.publish("queue", function(id) {
  return Queues.find({_id: id});
});

Meteor.publish("activeQueues", function() {
  return Queues.find({"status": {$ne: "done"}});
});