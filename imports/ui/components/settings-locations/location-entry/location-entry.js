import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';

import { updateLocation, deleteLocation } from '/imports/api/locations/methods.js';

import './location-entry.html';

Template.LocationEntry.onCreated(function onCreated() {
  this.state = new ReactiveDict();
  this.state.set('isEditing', false);
});

Template.LocationEntry.helpers({
  isNormal() {
    return !Template.instance().state.get('isEditing');
  },
  isEditing() {
    return Template.instance().state.get('isEditing');
  },
});

Template.LocationEntry.events({
  'click .js-remove-location'(event) {
    const locationId = this.location._id;
    const locationName = this.location.name;

    const sure = confirm(`Are you sure you want to delete ${locationName}?`);
    if (sure) {
      deleteLocation.call({ locationId }, (err) => {
        if (err) {
          console.error(err);
        }
      });
    }
  },

  'click .js-edit-location'(event, instance) {
    instance.state.set('isEditing', true);
  },

  'click .js-cancel-edit-location'(event, instance) {
    instance.state.set('isEditing', false);
  },

  'submit .js-location-name-edit-form'(event, instance) {
    event.preventDefault();
    const locationId = this.location._id;
    const name = event.target.name.value;
    updateLocation.call({ locationId, name }, (err) => {
      if (err) {
        console.error(err);
      }
    });
    instance.state.set('isEditing', false);
  },
});
