import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';

import { Locations } from '/imports/api/locations/locations';

import { createLocation } from '/imports/api/locations/methods';

import '/imports/ui/components/settings-locations/location-entry/location-entry';

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
});
