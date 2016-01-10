Template.index.onCreated(function() {
  var self = this;
  self.autorun(function() {
    self.subscribe("courses");
    self.subscribe("activeQueues");
    self.subscribe("allActiveTickets");
  });
});