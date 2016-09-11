import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { $ } from 'meteor/jquery';

import '/imports/ui/components/modals/modal-course-create/modal-course-create.js';

import './settings-courses.html';

Template.SettingsCourses.onCreated(function onCreated() {
  this.selectedCourseId = new ReactiveVar('');
});

Template.SettingsCourses.helpers({
  isSelectedCourse(course) {
    return course && (course._id === Template.instance().selectedCourseId.get());
  },

  modalCreateCourseArgs() {
    const instance = Template.instance();
    return {
      setSelectedCourseId(courseId) {
        instance.selectedCourseId.set(courseId);
      },
    };
  },
});

Template.SettingsCourses.events({
  'change .js-select-course'(event) {
    const value = event.target.value;
    if (value === 'new-course') {
      $('.modal-course-create').modal();
    }
  },
});
