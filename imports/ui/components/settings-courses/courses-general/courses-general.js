import { Template } from "meteor/templating";
import { FlowRouter } from "meteor/kadira:flow-router";
import { $ } from "meteor/jquery";

import { updateCourse, updateSettings } from "/imports/api/courses/methods";

import "./courses-general.html";

Template.CoursesGeneral.onRendered(() => {
  const tabId = FlowRouter.getQueryParam("tab");
  if (tabId) {
    $('a[href="#' + tabId + '"]').tab("show");
  }
});

Template.CoursesGeneral.helpers({
  isCurrentSignupGap(course, signupGap) {
    return course.settings.signupGap === signupGap;
  },
  hasSignupLimit(course) {
    return course.settings.signupLimit > 0;
  },
  isCurrentMissingWindow(course, missingWindow) {
    return course.settings.missingWindow === missingWindow;
  }
});

Template.CoursesGeneral.events({
  "submit #update-course-form"(event) {
    event.preventDefault();

    const data = {
      courseId: this.course._id,
      name: event.target.name.value,
      description: event.target.description.value
    };

    updateCourse.call(data, err => {
      if (err) console.error(err);
    });
  },

  "change #jsHasSignupLimit"(event) {
    $('#jsSignupLimit')[event.target.checked ? 'show' : 'hide']();
    $('#jsSignupLimit input').val(event.target.checked ? 1 : 0);
  },

  "change #update-course-settings-form input, change #update-course-settings-form select"() {
    $("#update-course-settings-form").submit();
  },

  "submit #update-course-settings-form"(event) {
    event.preventDefault();

    const data = {
      courseId: this.course._id,
      settings: {
        signupGap: parseInt(event.target.signupGap.value),
        signupLimit: parseInt(event.target.signupLimit.value),
        missingWindow: parseInt(event.target.missingWindow.value),
        restrictSessionsByDefault:
          event.target.restrictSessionsByDefault.checked,
        notifications: {
          allowEmail: event.target.allowEmail.checked,
          allowText: event.target.allowText.checked
        }
      }
    };

    updateSettings.call(data, err => {
      if (err) console.error(err);
    });
  }
});
