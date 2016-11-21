import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';
import { Locations } from '/imports/api/locations/locations.js';
import { createLocation } from '/imports/api/locations/methods.js';

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
    });
  },
});

Template.SettingsLocations.events({
  'submit #add-location-form'(event) {
    event.preventDefault();
    const name = event.target.locationName.value;
    if (name) {
      const data = {
        'name' : name,
      };

      createLocation.call(data, (err) => {
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
    console.error("Oops! Removing locations isn't supported!");
  },
});

