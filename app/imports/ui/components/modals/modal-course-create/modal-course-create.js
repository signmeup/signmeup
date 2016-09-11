import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';

import { createCourse } from '/imports/api/courses/methods.js';

import './modal-course-create.html';

Template.ModalCourseCreate.events({
  'submit #js-modal-course-create-form'(event) {
    event.preventDefault();

    const data = {
      name: event.target.name.value,
      description: event.target.description.value,
    };

    createCourse.call(data, (err, courseId) => {
      if (err) {
        console.error(err);
      } else {
        $('.modal-course-create').modal('hide');
        this.setSelectedCourseId(courseId);
      }
    });
  },
});
