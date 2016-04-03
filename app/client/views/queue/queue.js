Template.queue.onCreated(function() {
  var self = this;
  self.autorun(function() {
    var queueId = FlowRouter.getParam("queueId");
    self.subscribe("queue", queueId);
    self.subscribe("activeTickets", queueId);
    self.subscribe("courses");
  });
});

Template.queue.helpers({
  queue: function() {
    var queueId = FlowRouter.getParam("queueId");
    return Queues.findOne({_id: queueId});
  },
});
