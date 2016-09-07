import { Template } from 'meteor/templating';

import moment from 'moment';

import './ticket.html';

Template.Ticket.helpers({
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
