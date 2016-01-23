// Queues Publications

Meteor.publish("queue", function(queueId) {
  return Queues.find({_id: queueId});
});

Meteor.publish("activeQueues", function() {
  return Queues.find({"status": {$nin: ["ended", "cancelled"]}});
});