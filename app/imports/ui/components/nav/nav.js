import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import './nav.html';

Template.Nav.events({
  'click .js-sign-in'() {
    Meteor.loginWithSaml(() => {
      if (Meteor.user()) {
        /* eslint-disable no-console */
        console.log(`Welcome ${Meteor.user().profile.givenName}!`);
        /* eslint-enable no-console */
      }
    });
  },

  'click .js-sign-out'() {
    Meteor.logout();
  },
});
