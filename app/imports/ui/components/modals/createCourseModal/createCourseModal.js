import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';

import './createCourseModal.html';

function validateCreateCourseForm() {
  return true;
}

Template.createCourseModal.events({
  'click .js-submit-create-course-form': () => {
    // TODO: Use just HTML type=submit and form= to make this happen.
    $('.js-create-course-form').submit();
  },

  'submit .js-create-course-form': (event) => {
    event.preventDefault();

    // Validate form
    const isValid = validateCreateCourseForm();
    if (!isValid) return false;

    const name = event.target.name.value;
    const description = event.target.description.value;
    const listserv = event.target.listserv.value;

    // Create queue
    Meteor.call('createCourse', name, description, listserv, (err) => {
      if (err) {
        console.log(err);
      } else {
        $('.js-create-course-modal').modal('hide');
      }
    });

    return true;
  },
});
