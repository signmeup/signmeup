Template.index.helpers({
  "noActiveQueues": function() {
    return (Queues.find({status: "active"}).count() == 0);
  },

  "activeQueues": function() {
    return Queues.find({status: "active"});
  }
});