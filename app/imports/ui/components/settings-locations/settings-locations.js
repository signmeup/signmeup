import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';

import { Locations } from '/imports/api/locations/locations.js';

import { createLocation, deleteLocation } from '/imports/api/locations/methods.js';

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
});

