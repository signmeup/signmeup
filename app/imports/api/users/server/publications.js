/* eslint-disable prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';

Meteor.publish('users.self', function self() {
  return Meteor.users.find({
    _id: this.userId,
  }, {
    fields: {
      email: true,
      saml: true, // Adding this anticipating that we'll start storing data in `saml`
    },
  });
});

Meteor.publish('users.byId', function byId(userId) {
  return Meteor.users.find({
    _id: userId,
  }, {
    fields: Meteor.users.publicFields,
  });
});

Meteor.publish('users.byIds', function byIds(userIds) {
  return Meteor.users.find({
    _id: { $in: userIds },
  }, {
    fields: Meteor.users.publicFields,
  });
});

Meteor.publish('users.all', function all() {
  return Meteor.users.find({}, {
    fields: Meteor.users.publicFields,
  });
});
