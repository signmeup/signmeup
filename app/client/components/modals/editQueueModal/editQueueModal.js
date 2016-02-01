/** 
 * NOTE: Always render the modal with detachable: false, otherwise it gets
 * rendered, then removed from the DOM, then re-rendered within the dimmer by
 * Semantic. In the process, the Blaze event handlers get lost.
 */

Template.editQueueModal.onRendered(function() {
  var data = Template.currentData();
  var locationName = Locations.findOne(data.location).name;

  // Initialize location
  $('.js-location-dropdown')
    .dropdown({
      allowAdditions: true
    })
    .dropdown("set selected", locationName);

  // Initialize end time
  var now = moment();
  var defaultDate = data.endTime;
  this.$('.datetimepicker').datetimepicker({
    format: 'h:mm A, MMMM DD',
    defaultDate: defaultDate,
    sideBySide: true,
    stepping: 5
  });
});

Template.editQueueModal.events({
  /* TODO: Validate form inputs on blur */

  "click .js-submit-edit-queue-form": function(event) {
    $(".js-edit-queue-form").submit();
  },

  "submit .js-edit-queue-form": function(event) {
    event.preventDefault();
    var $form = $(event.target);

    // Validate form
    var isValid = validateEditQueueForm();
    if (!isValid) return false;

    var name = event.target.name.value;
    var location = event.target.location.value;

    var mTime = $(event.target.endTime).data("DateTimePicker").date();
    var time = mTime.valueOf();

    // Edit queue
    Meteor.call("updateQueue", this._id, name, location, time, function(err) {
      if (err)
        console.log(err);
      else
        $(".js-edit-queue-modal").modal("hide");
    });
  }
});

function validateEditQueueForm() {
  return true;
}
