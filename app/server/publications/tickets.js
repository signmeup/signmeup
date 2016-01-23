// Tickets Publications

Meteor.smartPublish("allActiveTickets", function() {
  // Note the smartPublish: we use this to return multiple
  // cursors of the same collection.
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