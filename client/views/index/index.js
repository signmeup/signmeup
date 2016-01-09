Template.index.onCreated(function() {
  var self = this;
  self.autorun(function() {
    self.subscribe("courses");
    self.subscribe("activeQueues");
  });
});

Template.index.helpers({
  "noActiveQueues": function() {
    return (Queues.find({status: "active"}).count() == 0);
  },

  "activeQueues": function() {
    // TODO: abstract out the logic to get activeQueues
    var activeQueues = Queues.find({"status": {$nin: ["done", "cancelled"]}});
    if(activeQueues.count() == 0) {
      return false;
    } else {
      return activeQueues;
    }
  }
});