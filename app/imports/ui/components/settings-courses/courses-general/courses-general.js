import { Template } from 'meteor/templating';

import { updateCourse } from '/imports/api/courses/methods.js';

import './courses-general.html';

Template.CoursesGeneral.events({
  'submit #update-course-form'(event) {
    event.preventDefault();

    const data = {
      courseId: this.course._id,
      name: event.target.name.value,
      description: event.target.description.value,
    };

    updateCourse.call(data, (err) => {
      if (err) console.error(err);
    });
  },
});
