Template.index.onCreated(function() {
  var self = this;
  self.autorun(function() {
    self.subscribe("courses");
    self.subscribe("activeQueues");
    self.subscribe("allActiveTickets");
    self.subscribe("locations");
  });
});

Template.taIndex.helpers({
  "taQueues": function() {
    var taCourses = Meteor.user().taCourses;
    return Queues.find({course: {$in: taCourses}}).fetch();
  },

  "otherQueues": function() {
    var taCourses = Meteor.user().taCourses;
    return Queues.find({course: {$nin: taCourses}}).fetch();
  }
});

Template.taIndex.events({
  "click .js-show-create-modal": function() {
    _showModal(".js-create-queue-modal");
  }
});