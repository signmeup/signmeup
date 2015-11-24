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
    var activeQueues = Queues.find({status: {$ne: "done"}});
    if(activeQueues.count() == 0) {
      return false;
    } else {
      return activeQueues;
    }
  }
});