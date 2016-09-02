// Ticket Methods

// TODO: Replace input error checks with check()
// TODO: Replace 'not-allowed' errors with 403 errors

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { _ } from 'meteor/underscore';

import Queues from '/imports/api/queues/queues';
import Tickets from '/imports/api/tickets/tickets';

import { authorized } from '/imports/lib/both/auth';
import { carriers } from '/imports/lib/both/carriers';
import { _filterActiveTicketIds } from '/imports/lib/both/filters';
import { _nextSignupTime } from '/imports/lib/both/signup-gap';
import { _getUserEmail } from '/imports/lib/both/users';

if (Meteor.isServer) {
  const notifications = require('/imports/lib/server/notifications'); // eslint-disable-line
  const waitTime = require('/imports/lib/server/wait-time'); // eslint-disable-line
}


function validateNotify(notify) {
  if (!notify) {
    return false;
  }

  let isValid = true;

  if (notify.types) {
    isValid = isValid && (Array.isArray(notify.types) && _.filter(notify.types, (t) => {
      return !(_.contains(['announce', 'email', 'text'], t));
    }).length === 0);
  }

  if (_.contains(notify.types, 'email') && !notify.email) return false;
  if (_.contains(notify.types, 'text') && !notify.phone && !notify.carrier) return false;

  if (notify.email) {
    // Ensure email is valid
    // http://stackoverflow.com/questions/27680544/meteorjs-email-form-validation
    return /^[A-Z0-9'.1234z_%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(notify.email);
  }

  if (notify.phone && notify.carrier) {
    isValid = isValid
      && (notify.phone.replace(/\D/g, '') === notify.phone) && notify.phone.length === 10
      && _.contains(_.values(carriers), notify.carrier);
  }

  return isValid;
}

Meteor.methods({
  addTicket(queueId, name, question, notify) {
    check(queueId, String);
    check(name, String);
    check(question, String);
    check(notify, Object);

    const user = Meteor.user();
    if (!user) {
      throw new Meteor.Error('no-user');
    }

    const queue = Queues.findOne({ _id: queueId });
    if (!queue) {
      throw new Meteor.Error('invalid-queue-id');
    }

    if (queue.status === 'ended') {
      throw new Meteor.Error('queue-ended');
    }

    if (!name) {
      throw new Meteor.Error('invalid-name');
    }

    if (!question) {
      // TODO: Handle optional question case
      throw new Meteor.Error('invalid-question');
    }

    if (!validateNotify(notify)) {
      throw new Meteor.Error('invalid-notify-options');
    }

    // Disable signing up again if an active ticket exists
    const activeTicketIds = _filterActiveTicketIds(queue.tickets);
    _.each(activeTicketIds, (id) => {
      const ticket = Tickets.findOne(id);
      if (ticket.owner.id === Meteor.userId()) {
        throw new Meteor.Error('already-signed-up');
      }
    });

    // Make sure student has waited for signupGap
    const nextSignupTime = _nextSignupTime(user._id, queueId);
    if (nextSignupTime !== null && Date.now() < nextSignupTime) {
      throw new Meteor.Error('wait-for-signup-gap');
    }

    const ticket = {
      createdAt: Date.now(),
      queueId,
      course: queue.course,
      owner: {
        id: user._id,
        name,
      },
      status: 'open',

      question,
      notify,
    };

    const ticketId = Tickets.insert(ticket);
    Queues.update({ _id: queueId }, { $push: { tickets: ticketId } });
    console.log(`Inserted ticket ${ticketId} to queue ${queueId}`);
  },

  notifyTicketOwner(ticketId, type) {
    check(ticketId, String);
    check(type, String);

    const ticket = Tickets.findOne(ticketId);
    if (!ticket) throw new Meteor.Error('invalid-ticket-id');

    if (!authorized.ta(this.userId, ticket.course)) {
      throw new Meteor.Error('not-allowed');
    }

    if (ticket.notify && ticket.notify.types && _.contains(ticket.notify.types, type)) {
      this.unblock();

      if (type === 'email') {
        notifications.endEmailNotification(ticketId); // eslint-disable-line no-undef
      } else if (type === 'text') {
        notifications.sendTextNotification(ticketId); // eslint-disable-line no-undef
      }
    }
  },

  markTicketAsDone(ticketId) {
    check(ticketId, String);

    const ticket = Tickets.findOne({ _id: ticketId });
    if (!ticket) {
      throw new Meteor.Error('invalid-ticket-id');
    }

    if (!authorized.ta(this.userId, ticket.course)) {
      throw new Meteor.Error('not-allowed');
    }

    Tickets.update({
      _id: ticketId,
    }, {
      $set: {
        status: 'done',
        doneAt: Date.now(),
        ta: {
          id: this.userId,
          email: _getUserEmail(this.userId),
        },
      },
    });

    waitTime.updateWaitTime(ticketId); // eslint-disable-line no-undef
    console.log(`Marked ticket ${ticketId} as done`);
  },

  cancelTicket(ticketId) {
    check(ticketId, String);
    const ticket = Tickets.findOne({ _id: ticketId });
    if (!ticket) {
      throw new Meteor.Error('invalid-ticket-id');
    }

    if (authorized.ta(this.userId, ticket.course) || this.userId === ticket.owner.id) {
      let taObject = ticket.ta || {};
      if (authorized.ta(this.userId, ticket.course)) {
        taObject = {
          id: this.userId,
          email: _getUserEmail(this.userId),
        };
      }

      const setObject = {
        status: 'cancelled',
        cancelledAt: Date.now(),
      };

      if (!_.isEmpty(taObject)) {
        _.extend(setObject, taObject);
      }

      Tickets.update({
        _id: ticketId,
      }, {
        $set: setObject,
      });
    }
  },
});
