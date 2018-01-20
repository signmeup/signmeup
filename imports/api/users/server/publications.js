/* eslint-disable prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';

import { Tickets } from '/imports/api/tickets/tickets';

Meteor.publish('users.self', function self() {
  return Meteor.users.find({
    _id: this.userId,
  }, {
    fields: Meteor.users.privateFields,
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
    fields: Meteor.users.protectedFields,
  });
});

Meteor.publish('users.onlineStaffByCourseId', function onlineStaffByCourseId(courseId) {
  const staff = Roles.getUsersInRole(['hta', 'ta'], courseId).fetch();
  const ids = staff.map((member) => { return member._id; });

  return Meteor.users.find({
    _id: { $in: ids },
    'status.online': true,
  }, {
    fields: Object.assign({}, Meteor.users.protectedFields, {
      'status.online': true,
      'status.idle': true,
    }),
  });
});

Meteor.publish('users.byTicket', function byTicket(ticketId) {
  const ticket = Tickets.findOne({ _id: ticketId });
  if (!ticket) return [];
  const isTa = Roles.userIsInRole(this.userId, ['admin', 'mta', 'hta', 'ta'], ticket.courseId);
  if (!isTa && !ticket.studentIds.includes(this.userId)) return [];

  return Meteor.users.find({
    _id: { $in: ticket.studentIds },
  }, {
    fields: Meteor.users.protectedFields,
  });
});
