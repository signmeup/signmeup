Template.queue.helpers({
  queue: function() {
    var queueId = FlowRouter.getParam("queueId");
    return Queues.findOne({_id: queueId});
  }
});