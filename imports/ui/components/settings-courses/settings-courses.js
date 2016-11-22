import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { $ } from 'meteor/jquery';

import { Courses } from '/imports/api/courses/courses.js';

import '/imports/ui/components/settings-courses/courses-general/courses-general.js';
import '/imports/ui/components/settings-courses/courses-people/courses-people.js';
import '/imports/ui/components/settings-courses/courses-analytics/courses-analytics.js';
import '/imports/ui/components/modals/modal-course-create/modal-course-create.js';

import './settings-courses.html';

Template.SettingsCourses.onCreated(function onCreated() {
  this.selectedCourseId = new ReactiveVar('');

  this.autorun(() => {
    this.subscribe('courses.all');
  });
});

Template.SettingsCourses.onRendered(function onRendered() {
  this.autorun(() => {
    if (Meteor.user()) {
      const selectedCourseId = Meteor.user().courses().fetch()[0];
      this.selectedCourseId.set(selectedCourseId);
    }
  });
});

Template.SettingsCourses.helpers({
  isSelectedCourse(course) {
    return course && course._id === Template.instance().selectedCourseId.get();
  },

  selectedCourse() {
    return Courses.findOne(Template.instance().selectedCourseId.get());
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
    } else {
      Template.instance().selectedCourseId.set(event.target.value);
    }
  },
});
