/* eslint-disable prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';

Meteor.publish('users.self', function self() {
  return Meteor.users.find({
    _id: this.userId,
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

Meteor.publish('users.byEmails', function byEmails(emails) {
  return Meteor.users.find({
    $or: [
      { 'emails.address': { $in: emails } },
    ],
  }, {
    fields: Meteor.users.publicFields,
  });
});

Meteor.publish('users.staffByCourseId', function staffByCourseId(courseId) {
  return Roles.getUsersInRole(['hta', 'ta'], courseId, {
    fields: Meteor.users.publicFields,
  });
});

Meteor.publish('users.onlineStaffByCourseId', function onlineStaffByCourseId(courseId) {
  const staff = Roles.getUsersInRole(['hta', 'ta'], courseId).fetch();
  const ids = staff.map((member) => { return member._id; });

  return Meteor.users.find({
    _id: { $in: ids },
    'status.online': true,
  }, {
    fields: Object.assign(Meteor.users.publicFields, {
      'status.online': true,
      'status.idle': true,
    }),
  });
});
