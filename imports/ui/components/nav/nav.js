import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import './nav.html';

Template.Nav.onCreated(function onCreated() {
  this.autorun(() => {
    this.subscribe('users.self');
    this.subscribe('courses.all');
  });
});

Template.Nav.events({
  'click .js-sign-in'() {
    Meteor.loginWithGoogle({
      loginUrlParameters: { hd: 'brown.edu' },
      requestPermissions: ['profile', 'email'],
    }, () => {
      if (Meteor.user()) {
        /* eslint-disable no-console */
        console.log(`Welcome ${Meteor.user().firstName()}!`);
        /* eslint-enable no-console */
      }
    });
  },

  'click .js-sign-out'() {
    Meteor.logout();
  },
});
