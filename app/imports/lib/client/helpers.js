// Functions

import { Template } from 'meteor/templating';

import { moment } from 'meteor/momentjs:moment';
import { $ } from 'meteor/jquery';

import Locations from '/imports/api/locations/locations';

export function _formatTime(milliseconds, format = 'h:mm A, MMMM DD') {
  return moment(milliseconds).format(format);
}

export function _showModal(selector, focusElement) {
  $(selector)
    .modal({
      transition: 'fade up',
      duration: 200,
      detachable: false, // Needed to maintain Blaze events
      autofocus: !(focusElement),
    })
    .modal('show');

  if (focusElement) {
    // Semantic UI removes focus from all fields if `autofocus`
    // above is set to false. We wait for it to do that, then set
    // focus on the element we want.
    setTimeout(() => {
      $(selector).find(focusElement).focus();
    }, 300);
  }
}

export function _getLocations() {
  return Locations.find({});
}

export function _timeInMinutes(milliseconds) {
  const d = moment.duration(milliseconds, 'milliseconds');
  return Math.floor(d.asMinutes());
}

// Global Helpers

Template.registerHelper('locations', _getLocations);
