import { Template } from 'meteor/templating';

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
