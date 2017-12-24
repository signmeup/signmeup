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

Meteor.publish('users.byIds', function byIds(ids) {
  const userIds = ids.userIds;
  const courseId = ids.courseId;
  const ta = Roles.userIsInRole(this.userId, ['admin', 'mta', 'hta', 'ta'], courseId);
  return Meteor.users.find({
    _id: { $in: userIds },
  }, {
    fields: ta ? Meteor.users.hiddenFields : Meteor.users.publicFields,
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
    fields: Meteor.users.hiddenFields,
  });
});

Meteor.publish('users.onlineStaffByCourseId', function onlineStaffByCourseId(courseId) {
  const staff = Roles.getUsersInRole(['hta', 'ta'], courseId).fetch();
  const ids = staff.map((member) => { return member._id; });

  return Meteor.users.find({
    _id: { $in: ids },
    'status.online': true,
  }, {
    fields: Object.assign(Meteor.users.hiddenFields, {
      'status.online': true,
      'status.idle': true,
    }),
  });
});
