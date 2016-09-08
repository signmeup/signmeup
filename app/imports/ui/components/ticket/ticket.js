import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { _ } from 'meteor/underscore';

import moment from 'moment';

import '/imports/ui/components/ticket/ticket-drawer/ticket-drawer.js';
import '/imports/ui/components/ticket/ticket-ta-actions/ticket-ta-actions.js';

import './ticket.html';

Template.Ticket.helpers({
  currentUserTicket(ticket) {
    return (Meteor.user() && _.contains(ticket.studentIds, Meteor.userId()));
  },

  currentUserClass(ticket) {
    if (Meteor.user() && _.contains(ticket.studentIds, Meteor.userId())) {
      return 'current-user-ticket';
    }

    return '';
  },

  studentNames(students) {
    let result = '';

    students.fetch().forEach((student, i) => {
      if (i > 0) {
        result += ', ';
      }

      result += student.fullName();
    });

    return result;
  },

  formattedTimestamp(createdAt) {
    return moment(createdAt).fromNow();
  },
});
