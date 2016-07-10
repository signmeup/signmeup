Template.createCourseModal.events({
  "click .js-submit-create-course-form": function() {
    // TODO: Use just HTML type=submit and form= to make this happen.
    $(".js-create-course-form").submit();
  },

  "submit .js-create-course-form": function(event) {
    event.preventDefault();
    var $form = $(event.target);

    // Validate form
    var isValid = validateCreateCourseForm();
    if (!isValid) return false;

    var name = event.target.name.value;
    var description = event.target.description.value;
    var listserv = event.target.listserv.value;

    // Create queue
    Meteor.call("createCourse", name, description, listserv, function(err) {
      if (err)
        console.log(err);
      else
        $(".js-create-course-modal").modal("hide");
    });
  }
});

function validateCreateCourseForm() {
  return true;
}