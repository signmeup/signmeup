/* eslint-disable prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';

import { Sessions } from '/imports/api/sessions/sessions';

Meteor.publish('sessions.byQueueId', function byQueueId(queueId) {
  return Sessions.find({
    queueId,
  }, {
    fields: {
      secret: false,
    },
  });
});
