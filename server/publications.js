Meteor.publish("queue", function(id) {
  return Queues.find({_id: id});
});