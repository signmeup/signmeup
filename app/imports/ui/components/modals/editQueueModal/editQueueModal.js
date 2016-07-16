/**
 * NOTE: Always render the modal with detachable: false, otherwise it gets
 * rendered, then removed from the DOM, then re-rendered within the dimmer by
 * Semantic. In the process, the Blaze event handlers get lost.
 */

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';

import Locations from '/imports/api/locations/locations';

function validateEditQueueForm() {
  return true;
}

Template.editQueueModal.onRendered(() => {
  const data = Template.currentData();
  const locationName = Locations.findOne(data.location).name;

  // Initialize location
  $('.js-location-dropdown')
    .dropdown({
      allowAdditions: true,
    })
    .dropdown('set selected', locationName);

  // Initialize end time
  const defaultDate = data.endTime;
  this.$('.datetimepicker').datetimepicker({
    format: 'h:mm A, MMMM DD',
    defaultDate,
    sideBySide: true,
    stepping: 5,
  });
});

Template.editQueueModal.events({
  /* TODO: Validate form inputs on blur */

  'click .js-submit-edit-queue-form': () => {
    $('.js-edit-queue-form').submit();
  },

  'submit .js-edit-queue-form': (event) => {
    event.preventDefault();

    // Validate form
    const isValid = validateEditQueueForm();
    if (!isValid) return false;

    const name = event.target.name.value;
    const location = event.target.location.value;

    const mTime = $(event.target.endTime).data('DateTimePicker').date();
    const time = mTime.valueOf();

    // Edit queue
    Meteor.call('updateQueue', this._id, name, location, time, (err) => {
      if (err) {
        console.log(err);
      } else {
        $('.js-edit-queue-modal').modal('hide');
      }
    });

    return true;
  },
});
