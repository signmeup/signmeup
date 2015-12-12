Template.admin.onCreated(function() {
  var self = this;
  self.autorun(function() {
    self.subscribe("courses");
    self.subscribe("locations");
    self.subscribe("queues");
    self.subscribe("users");
  });
});

Template.admin.onRendered(function() {
  $(".courseMenu .item").eq(0).addClass("active");
  $(".courseSettings").eq(0).addClass("active");
});

Template.admin.helpers({
  "courses": function() {
    return Courses.find({});
  }
});