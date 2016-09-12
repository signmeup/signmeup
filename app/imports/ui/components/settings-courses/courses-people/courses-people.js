import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';

import { addRoleGivenEmail } from '/imports/api/users/methods.js';

import './courses-people.html';

Template.CoursesPeople.onCreated(function onCreated() {
  this.autorun(() => {
    this.subscribe('users.all');
  });
});

Template.CoursesPeople.events({
  'submit #add-hta-form'(event) {
    event.preventDefault();
    const email = event.target.htaEmail.value;
    if (email) {
      const data = {
        email,
        role: 'hta',
        courseId: this.course._id,
      };

      addRoleGivenEmail.call(data, (err) => {
        if (err) {
          console.log(err);
        } else {
          $('.js-hta-email').val('');
        }
      });
    }
  },

  'submit #add-ta-form'(event) {
    event.preventDefault();
    const email = event.target.taEmail.value;
    if (email) {
      const data = {
        email,
        role: 'ta',
        courseId: this.course._id,
      };

      addRoleGivenEmail.call(data, (err) => {
        if (err) {
          console.log(err);
        } else {
          $('.js-ta-email').val('');
        }
      });
    }
  },
});
