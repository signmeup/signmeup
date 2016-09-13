import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Roles } from 'meteor/alanning:roles';

import '/imports/ui/components/settings-courses/settings-courses.js';
import '/imports/ui/components/settings-locations/settings-locations.js';
import '/imports/ui/components/settings-people/settings-people.js';
import '/imports/ui/components/settings-profile/settings-profile.js';

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
    return Roles.userIsInRole(this._id, ['admin', 'mta']) ||
           Meteor.user().htaCourses().count() > 0;
  },
});
