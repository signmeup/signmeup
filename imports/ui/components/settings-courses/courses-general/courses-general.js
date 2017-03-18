import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';

import { updateCourse, updateSettings } from '/imports/api/courses/methods';

import './courses-general.html';

Template.CoursesGeneral.helpers({
  isCurrentSignupGap(course, signupGap) {
    return course.settings.signupGap === signupGap;
  },
});

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

  'change #update-course-settings-form input, change #update-course-settings-form select'() {
    $('#update-course-settings-form').submit();
  },

  'submit #update-course-settings-form'(event) {
    event.preventDefault();

    const data = {
      courseId: this.course._id,
      settings: {
        signupGap: parseInt(event.target.signupGap.value),
        restrictSessionsByDefault: event.target.restrictSessionsByDefault.checked,
        notifications: {
          allowEmail: event.target.allowEmail.checked,
          allowText: event.target.allowText.checked,
        },
      },
    };

    updateSettings.call(data, (err) => {
      if (err) console.error(err);
    });
  },
});
