import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';

import { updateLocation } from '/imports/api/locations/methods.js';

import './location-entry.html';

Template.LocationEntry.onCreated(function onCreated() {
  this.state = new ReactiveDict();
  this.state.set('mode', 'normal');
});

Template.LocationEntry.helpers({
  isNormal() {
    return Template.instance().state.get('mode') === 'normal';
  },
  isEditing() {
    return Template.instance().state.get('mode') === 'editing';
  },
});

Template.LocationEntry.events({
  'click .js-edit-location'(event, instance) {
    instance.state.set('mode', 'editing');
  },

  'click .js-cancel-edit-location'(event, instance) {
    instance.state.set('mode', 'normal');
  },

  'submit .js-location-name-edit-form'(event, instance) {
    event.preventDefault();
    const locationId = event.target.id.value;
    const name = event.target.name.value;
    updateLocation.call({ locationId, name }, (err) => {
      if (err) {
        console.error(err);
      }
    });
    instance.state.set('mode', 'normal');
  },
});
