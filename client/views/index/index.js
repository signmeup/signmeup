Template.index.onCreated(function() {
  var self = this;
  self.autorun(function() {
    self.subscribe("courses");
    self.subscribe("activeQueues");
    self.subscribe("allActiveTickets");
  });
});

Template.taIndex.helpers({
  "taQueues": function() {
    return Queues.find({course: {$in: _getUserCourses()}}).fetch();
  },

  "otherQueues": function() {
    return Queues.find({course: {$nin: _getUserCourses()}}).fetch();
  }
});

Template.taIndex.events({
  "click .js-show-create-modal": function() {
    _showModal(".js-create-queue-modal");
  }
});