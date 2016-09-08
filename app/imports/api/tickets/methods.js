import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Roles } from 'meteor/alanning:roles';
import { _ } from 'meteor/underscore';

import { Queues } from '/imports/api/queues/queues.js';
import { Sessions } from '/imports/api/sessions/sessions.js';
import { Tickets, NotificationsSchema } from '/imports/api/tickets/tickets.js';

import { createUser } from '/imports/lib/both/users.js';

export const createTicket = new ValidatedMethod({
  name: 'tickets.createTicket',
  validate: new SimpleSchema({
    queueId: { type: String, regEx: SimpleSchema.RegEx.Id },
    studentEmails: { type: [String], regEx: SimpleSchema.RegEx.Email, minCount: 1 },
    question: { type: String, optional: true },
    notifications: { type: NotificationsSchema },
    sessionId: { type: String, regEx: SimpleSchema.RegEx.Id, optional: true },
    secret: { type: String, regEx: SimpleSchema.RegEx.Id, optional: true },
  }).validator(),
  run({ queueId, studentEmails, question, notifications, sessionId, secret }) {
    const queue = Queues.findOne(queueId);
    if (!queue) {
      throw new Meteor.Error('queues.doesNotExist',
        `No queue exists with id ${queueId}`);
    }

    if (sessionId && !Sessions.findOne(sessionId)) {
      throw new Meteor.Error('sessions.doesNotExist',
        `No session exists with id ${sessionId}`);
    }

    // Gather student ids
    const studentIds = studentEmails.map((email) => {
      const student = Meteor.users.findOne({
        $or: [
          { email: email }, // eslint-disable-line object-shorthand
          { 'emails.address': email },
        ],
      });

      if (student) return student._id;
      return createUser({ email });
    });

    // Check: restricted sessions
    if (Meteor.isServer && queue.isRestricted()) {
      const sessionMatchesQueue = _.contains(queue.settings.restrictedSessionIds, sessionId);
      if (!sessionMatchesQueue) {
        throw new Meteor.Error('tickets.createTicket.invalidSession',
          `Cannot signup with invalid session ${sessionId}`);
      }

      const secretMatchesSession = secret && (Sessions.findOne(sessionId).secret === secret);
      if (!secretMatchesSession) {
        throw new Meteor.Error('tickets.createTicket.invalidSecret',
          `Cannot signup with invalid secret ${secret}`);
      }
    }

    // TODO: Check: duplicate signups

    // TODO: Check: signup gap

    // Create ticket
    const ticketId = Tickets.insert({
      courseId: queue.courseId,
      queueId,

      studentIds,
      question,

      notifications,

      createdAt: new Date(),
      createdBy: this.userId || studentIds[0],
    });

    // Add ticket to queue
    Queues.update({
      _id: queueId,
    }, {
      $push: {
        ticketIds: ticketId,
      },
    });
  },
});

export const deleteTicket = new ValidatedMethod({
  name: 'tickets.deleteTicket',
  validate: new SimpleSchema({
    ticketId: { type: String, regEx: SimpleSchema.RegEx.Id },
  }).validator(),
  run({ ticketId }) {
    const ticket = Tickets.findOne(ticketId);
    if (!ticket) {
      throw new Meteor.Error('tickets.doesNotExist'
        `No ticket exists with id ${ticketId}`);
    }

    const taOrAbove = Roles.userIsInRole(
      this.userId,
      ['admin', 'mta', 'hta', 'ta'],
      ticket.courseId
    );
    if (!(ticket.belongsToUser(this.userId) || taOrAbove)) {
      throw new Meteor.Error('tickets.deleteTicket.unauthorized',
        'Only ticket owners or TAs and above can delete tickets.');
    }

    Tickets.update({
      _id: ticketId,
    }, {
      $set: {
        status: 'deleted',
        deletedAt: new Date(),
        deletedBy: this.userId,
      },
    });
  },
});
