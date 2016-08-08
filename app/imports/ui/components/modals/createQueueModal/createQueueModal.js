/**
 * NOTE: Always render the modal with detachable: false, otherwise it gets
 * rendered, then removed from the DOM, then re-rendered within the dimmer by
 * Semantic. In the process, the Blaze event handlers get lost.
 */

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { moment } from 'meteor/momentjs:moment';
import { $ } from 'meteor/jquery';

import './createQueueModal.html';

function validateCreateQueueForm() {
  return true;
}

Template.createQueueModal.onRendered(() => {
  // Initialize location
  $('.js-location-dropdown')
    .dropdown({
      allowAdditions: true,
    });

  // Initialize end time
  const now = moment();
  const defaultDate = now.startOf('hour').add(4, 'hours');
  this.$('.datetimepicker').datetimepicker({
    format: 'h:mm A, MMMM DD',
    defaultDate,
    sideBySide: true,
    stepping: 5,
  });
});

Template.createQueueModal.events({
  /* TODO: Validate form inputs on blur */

  'click .js-submit-create-queue-form': () => {
    $('.js-create-queue-form').submit();
  },

  'submit .js-create-queue-form': (event) => {
    event.preventDefault();

    // Validate form
    const isValid = validateCreateQueueForm();
    if (!isValid) return false;

    const course = event.target.course.value;
    const name = event.target.name.value;
    const location = event.target.location.value;

    const mTime = $(event.target.endTime).data('DateTimePicker').date();
    const time = mTime.valueOf();

    // Create queue
    Meteor.call('createQueue', course, name, location, time, (err) => {
      if (err) {
        console.log(err);
      } else {
        $('.js-create-queue-modal').modal('hide');
      }
    });

    return true;
  },
});
