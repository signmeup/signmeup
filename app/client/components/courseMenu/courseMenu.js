Template.courseMenu.onRendered(function() {
  var firstCourse = Template.currentData().courses.fetch()[0].name;
  setCourse(firstCourse);
});

Template.courseMenu.events({
  "click .item:not(.header)": function(event) {
    setCourse(event.target.dataset.course);
  },

  "click .js-add-course": function() {
    _showModal(".js-create-course-modal");
  }
});

function setCourse(name) {
  // Make menu item active
  $(".courseMenu .item").removeClass("active");
  $(".courseMenu .item[data-course='" + name + "']").addClass("active");

  // Make course settings active
  $(".courseSettings").removeClass("active");
  $(".courseSettings[data-course='" + name + "']").addClass("active");
}