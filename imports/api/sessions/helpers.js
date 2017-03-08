import { Meteor } from 'meteor/meteor';

import { Queues } from '/imports/api/queues/queues';
import { Sessions } from '/imports/api/sessions/sessions';

Sessions.helpers({
  user() {
    return Meteor.users.findOne(this.userId);
  },

  queue() {
    return Queues.findOne(this.queueId);
  },
});
