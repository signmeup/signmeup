import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Roles } from 'meteor/alanning:roles';

import '/imports/ui/components/settings-courses/settings-courses';
import '/imports/ui/components/settings-locations/settings-locations';
import '/imports/ui/components/settings-people/settings-people';
import '/imports/ui/components/settings-profile/settings-profile';

import './settings.html';

Template.Settings.onRendered(function onRendered() {
  this.autorun(() => {
    if (this.subscriptionsReady()) {
      document.title = 'Settings · SignMeUp';
    }
  });
});

Template.Settings.helpers({
  showSettings() {
    return Meteor.user() &&
           (Roles.userIsInRole(Meteor.userId(), ['admin', 'mta']) ||
            Meteor.user().htaCourses().count() > 0);
  },
});
