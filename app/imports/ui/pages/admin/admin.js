// TODO: Block access to non-admins.

Template.admin.onCreated(function() {
  var self = this;
  self.autorun(function() {
    self.subscribe("courses");
    self.subscribe("locations");
    self.subscribe("queues");
    self.subscribe("allUsers");
  });
});

Template.admin.helpers({
  showAdmin: function() {
    return (authorized.admin(Meteor.userId) || authorized.hta(Meteor.userId));
  },

  "courses": function() {
    return Courses.find({});
  }
});