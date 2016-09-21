import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import './footer.html';

Template.Footer.helpers({
  version() {
    return Meteor.settings.public.version || 'Dev';
  },
});
