import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';

import { Locations } from '/imports/api/locations/locations.js';

import { createLocation, updateLocation, deleteLocation } from '/imports/api/locations/methods.js';

import './settings-locations.html';

Template.SettingsLocations.onCreated(function onCreated() {
  this.autorun(() => {
    this.subscribe('locations.active');
  });
});

Template.SettingsLocations.helpers({
  locations() {
    return Locations.find({
      deletedAt: { $exists: false },
    }, {
      sort: { name: 1 },
    });
  },
});

Template.SettingsLocations.events({
  'submit #add-location-form'(event) {
    event.preventDefault();
    const name = event.target.locationName.value;
    if (name) {
      createLocation.call({ name }, (err) => {
        if (err) {
          console.error(err);
        } else {
          $('.js-location-name').val('');
        }
      });
    }
  },

  'click .js-remove-location'(event) {
    const locationId = event.target.dataset.id;
    const locationName = event.target.dataset.name;

    const sure = confirm(`Are you sure you want to delete ${locationName}?`);
    if (sure) {
      deleteLocation.call({ locationId }, (err) => {
        if (err) {
          console.error(err);
        }
      });
    }
  },

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

