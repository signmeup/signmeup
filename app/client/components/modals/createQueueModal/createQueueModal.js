/** 
 * NOTE: Always render the modal with detachable: false, otherwise it gets
 * rendered, then removed from the DOM, then re-rendered within the dimmer by
 * Semantic. In the process, the Blaze event handlers get lost.
 */

Template.createQueueModal.onRendered(function() {
  // Initialize location
  $('.js-location-dropdown')
    .dropdown({
      allowAdditions: true
    });

  // Initialize end time
  var now = moment();
  var defaultDate = now.startOf("hour").add(4, "hours");
  this.$('.datetimepicker').datetimepicker({
    format: 'h:mm A, MMMM DD',
    defaultDate: defaultDate,
    sideBySide: true,
    stepping: 5
  });
});

Template.createQueueModal.events({
  /* TODO: Validate form inputs on blur */

  "click .js-submit-create-queue-form": function(event) {
    $(".js-create-queue-form").submit();
  },

  "submit .js-create-queue-form": function(event) {
    event.preventDefault();
    var $form = $(event.target);

    // Validate form
    var isValid = validateCreateQueueForm();
    if (!isValid) return false;

    var course = event.target.course.value;
    var name = event.target.name.value;
    var location = event.target.location.value;

    var mTime = $(event.target.endTime).data("DateTimePicker").date();
    var time = mTime.valueOf();

    // Create queue
    Meteor.call("createQueue", course, name, location, time, function(err) {
      if (err)
        console.log(err);
      else
        $(".js-create-queue-modal").modal("hide");
    });
  }
});

function validateCreateQueueForm() {
  return true;
}
