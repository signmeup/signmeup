/* eslint-disable prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';

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

Meteor.publish('users.byIds', function byIds(userIds) {
  return Meteor.users.find({
    _id: { $in: userIds },
  }, {
    fields: Meteor.users.publicFields,
  });
});

Meteor.publish('users.byEmails', function byEmails(emails) {
  return Meteor.users.find({
    $or: [
      { email: { $in: emails } },
      { 'emails.address': { $in: emails } },
    ],
  }, {
    fields: Meteor.users.publicFields,
  });
});

Meteor.publish('users.byCourseId', function byCourseId(courseId) {
  return Roles.getUsersInRole(['hta', 'ta'], courseId, {
    fields: Meteor.users.publicFields,
  });
});
