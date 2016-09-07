import { Meteor } from 'meteor/meteor';

import { Sessions } from '/imports/api/sessions/sessions.js';

Sessions.helpers({
  user() {
    return Meteor.users.findOne(this.userId);
  },
});
