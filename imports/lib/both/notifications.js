import { Meteor } from 'meteor/meteor';
import { Email } from 'meteor/email';

import { Courses } from '/imports/api/courses/courses';
import { Queues } from '/imports/api/queues/queues';

export class Notifications {
  static sendEmailNotification(ticket) {
    const queue = Queues.findOne(ticket.queueId);
    if (!queue) {
      throw new Meteor.Error('queues.doesNotExist',
        `No queue exists with id ${ticket.queueId}`);
    }

    const course = Courses.findOne(queue.courseId);
    if (!course) {
      throw new Meteor.Error('courses.doesNotExist',
        `No course exists with id ${queue.courseId}`);
    }

    if (ticket.notifications && ticket.notifications.email) {
      try {
        Email.send({
          to: ticket.notifications.email,
          from: 'signmeup-dev@lists.cs.brown.edu',
          subject: `[SignMeUp] You're up for ${course.name} ${queue.name}`,
          text: 'A TA is looking for you. Head over to hours now.',
        });
      } catch (err) {
        throw new Meteor.Error(err);
      }
    } else {
      throw new Meteor.Error('notifications.noEmailAddress');
    }
  }

  static sendTextNotification(ticket) {
    const queue = Queues.findOne(ticket.queueId);
    if (!queue) {
      throw new Meteor.Error('queues.doesNotExist',
        `No queue exists with id ${ticket.queueId}`);
    }

    const course = Courses.findOne(queue.courseId);
    if (!course) {
      throw new Meteor.Error('courses.doesNotExist',
        `No course exists with id ${queue.courseId}`);
    }

    const phone = ticket.notifications && ticket.notifications.phone;
    if (phone && phone.number && phone.carrier) {
      try {
        Email.send({
          to: `${ticket.notifications.phone.number}@${ticket.notifications.phone.carrier}`,
          from: 'signmeup-dev@lists.cs.brown.edu',
          subject: `${course.name} ${queue.name}`,
          text: 'A TA is looking for you. Head over to hours now.',
        });
      } catch (err) {
        throw new Meteor.Error(err);
      }
    } else {
      throw new Meteor.Error('notifications.noPhoneOrCarrier',
        'Failed to send text message due to missing phone number or carrier');
    }
  }
}
