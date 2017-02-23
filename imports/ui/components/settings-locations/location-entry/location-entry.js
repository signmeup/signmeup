import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import { updateLocation } from '/imports/api/locations/methods.js';

import './location-entry.html';

Template.LocationEntry.events({
  'click .js-location-name-edit-button'(event) {
    const parent = $(event.target).parents('.card-block');
    parent.find('.location-name').addClass('hidden');
    const edit = parent.find('.location-name-edit');
    edit.removeClass('hidden');
    edit.find('input').focus();
  },

  'blur .js-location-name-edit'(event) {
    const parent = $(event.target).parents('.card-block');
    const locationId = parent.data('location-id');
    const name = event.target.value;
    parent.find('.location-name-edit').addClass('hidden');
    updateLocation.call({ locationId, name }, (err) => {
      if (err) {
        console.error(err);
      }
    });
    parent.find('.location-name').removeClass('hidden');
  },
});
