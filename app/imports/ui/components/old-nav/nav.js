import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import './nav.html';

Template.nav.events({
  'click .js-sign-in': (event) => {
    event.preventDefault();
    Meteor.loginWithSaml(() => {
      console.log(`Welcome ${Meteor.user().profile.givenName}!`); // eslint-disable-line no-console
    });
  },

  'click .js-sign-out': (event) => {
    event.preventDefault();
    Meteor.logout();
  },
});
