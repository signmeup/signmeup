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
    // Note: Queues only has activeQueues, based on the subscription above
    return Queues.find({course: {$in: _getUserCourseNames()}}).fetch();
  },

  "otherQueues": function() {
    // Note: Queues only has activeQueues, based on the subscription above
    return Queues.find({course: {$nin: _getUserCourseNames()}}).fetch();
  }
});

Template.taIndex.events({
  "click .js-show-create-modal": function() {
    _showModal(".js-create-queue-modal");
  }
});