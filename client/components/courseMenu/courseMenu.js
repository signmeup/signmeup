Template.courseMenu.events({
  "click .item": function(event) {
    /* Make menu item active */
    $(".courseMenu .item").removeClass("active");
    $(event.target).addClass("active");

    /* Make course settings active */
    var course = event.target.dataset.course;
    var courseSettings = $(".courseSettings[data-course='" + course + "']");
    $(".courseSettings").removeClass("active");
    courseSettings.addClass("active");
  }
});