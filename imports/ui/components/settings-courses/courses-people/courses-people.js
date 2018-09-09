import { Template } from "meteor/templating";
import { $ } from "meteor/jquery";

import { addRoleGivenEmail, removeRole } from "/imports/api/users/methods";

import "./courses-people.html";

Template.CoursesPeople.onCreated(function onCreated() {
  this.autorun(() => {
    this.subscribe("users.staffByCourseId", Template.currentData().course._id);
  });
});

Template.CoursesPeople.helpers({
  htas(course) {
    const htas = course.htas().fetch();
    return htas.sort((a, b) => {
      return a.fullName().localeCompare(b.fullName());
    });
  },

  tas(course) {
    const tas = course.tas().fetch();
    return tas.sort((a, b) => {
      return a.fullName().localeCompare(b.fullName());
    });
  }
});

Template.CoursesPeople.events({
  "submit #add-hta-form"(event) {
    event.preventDefault();
    const email = event.target.htaEmail.value.toLowerCase();
    if (email) {
      const data = {
        email,
        role: "hta",
        courseId: this.course._id
      };

      addRoleGivenEmail.call(data, err => {
        if (err) {
          console.error(err);
        } else {
          $(".js-hta-email").val("");
        }
      });
    }
  },

  "submit #add-ta-form"(event) {
    event.preventDefault();
    const email = event.target.taEmail.value.toLowerCase();
    if (email) {
      const data = {
        email,
        role: "ta",
        courseId: this.course._id
      };

      addRoleGivenEmail.call(data, err => {
        if (err) {
          console.error(err);
        } else {
          $(".js-ta-email").val("");
        }
      });
    }
  },

  "click .js-remove-hta"(event) {
    const userId = event.target.dataset.id;
    if (userId) {
      const data = {
        userId,
        role: "hta",
        courseId: this.course._id
      };

      removeRole.call(data, err => {
        if (err) console.error(err);
      });
    }
  },

  "click .js-remove-ta"(event) {
    const userId = event.target.dataset.id;
    if (userId) {
      const data = {
        userId,
        role: "ta",
        courseId: this.course._id
      };

      removeRole.call(data, err => {
        if (err) console.error(err);
      });
    }
  }
});
