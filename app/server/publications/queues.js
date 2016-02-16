// Queues Publications

Meteor.publish("queue", function(queueId) {
  return Queues.find({_id: queueId});
});

Meteor.publish("activeQueues", function() {
  return Queues.find({"status": {$nin: ["ended", "cancelled"]}});
});

Meteor.publish("allQueuesInRange", function(course, startTime, endTime) {
  if(!authorized.hta(this.userId, course))
    throw new Meteor.Error("not-allowed");

  var startTime = startTime || 0,
      endTime = endTime || Date.now();

  return Queues.find({
    course: course,
    startTime: {$gte: startTime, $lte: endTime}
  });
});