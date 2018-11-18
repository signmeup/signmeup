import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { ReactiveVar } from "meteor/reactive-var";
import { FlowRouter } from "meteor/kadira:flow-router";
import { $ } from "meteor/jquery";

import { Courses } from "/imports/api/courses/courses";

import "/imports/ui/components/settings-courses/courses-general/courses-general";
import "/imports/ui/components/settings-courses/courses-people/courses-people";
import "/imports/ui/components/settings-courses/courses-analytics/courses-analytics";
import "/imports/ui/components/modals/modal-course-create/modal-course-create";

import "./settings-courses.html";

Template.SettingsCourses.onCreated(function onCreated() {
  this.selectedCourseId = new ReactiveVar(FlowRouter.getQueryParam("course"));

  this.autorun(() => {
    this.subscribe("courses.all");
  });
});

Template.SettingsCourses.onRendered(function onRendered() {
  this.autorun(() => {
    const courseId = FlowRouter.getQueryParam("course");
    if (!courseId && Meteor.user()) {
      const selectedCourseId = Meteor.user()
        .courses()
        .fetch()[0]._id;
      this.selectedCourseId.set(selectedCourseId);
      FlowRouter.setQueryParams({ course: selectedCourseId });
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
        FlowRouter.setQueryParams({ course: courseId });
      }
    };
  }
});

Template.SettingsCourses.events({
  "change .js-select-course"(event) {
    const value = event.target.value;
    if (value === "new-course") {
      $(".modal-course-create").modal();
    } else {
      Template.instance().selectedCourseId.set(event.target.value);
      FlowRouter.setQueryParams({ course: event.target.value });
    }
  }
});
