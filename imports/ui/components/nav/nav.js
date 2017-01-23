import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Roles } from 'meteor/alanning:roles';

import './nav.html';

Template.Nav.onCreated(function onCreated() {
  this.autorun(() => {
    this.subscribe('users.self');
    this.subscribe('courses.all');
  });
});

Template.Nav.helpers({
  showSettings() {
    return Meteor.user() &&
           (Roles.userIsInRole(Meteor.userId(), ['admin', 'mta']) ||
            Meteor.user().htaCourses().fetch().length > 0);
  },
});

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
    const isSamlUser = Meteor.user().isSamlUser();
    Meteor.logout((err) => {
      if (!err && isSamlUser) {
        window.location = 'https://sso.brown.edu/idp/shib_logout.jsp';
      }
    });
  },
});
