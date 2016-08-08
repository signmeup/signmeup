import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { $ } from 'meteor/jquery';

import Courses from '/imports/api/courses/courses';

import { _nextSignupTime } from '/imports/lib/both/signup-gap';

import './signupGap.html';

Template.signupGap.onCreated(() => {
  const self = this;
  self.signupGap = new ReactiveVar(0);
  self.timeRemaining = new ReactiveVar(0);

  self.autorun(() => {
    // Reactively update signupGap
    const courseSettings = Courses.findOne({ name: Template.currentData().course }).settings || {};
    const signupGap = courseSettings.signupGap || 0;
    self.signupGap.set(signupGap);

    // Reactively update the timeRemaining for user to sign up again
    if (self.interval) Meteor.clearInterval(self.interval);

    const nextSignupTime = _nextSignupTime(Meteor.userId(), Template.currentData()._id);
    if (nextSignupTime === null) return;

    self.interval = Meteor.setInterval(() => {
      self.timeRemaining.set(nextSignupTime - Date.now());
    }, 1000);
  });
});

Template.signupGap.helpers({
  showMessage: () => {
    const timeRemaining = Template.instance().timeRemaining.get();
    const signupGap = Template.instance().signupGap.get();

    const show = (this.status !== 'ended'
      && timeRemaining < signupGap
      && timeRemaining > 0);

    // TODO: Come up with a cleaner way to do this?
    // Perhaps with a reactive variable that lives within the scope of queueList?
    const $joinButton = $('.js-show-join-queue');
    if (show) {
      $joinButton.addClass('disabled');
    } else {
      $joinButton.removeClass('disabled');
    }

    return show;
  },

  timeRemaining: () => {
    const ms = Template.instance().timeRemaining.get();
    const s = ms / 1000.0;
    if (s < 60) {
      return `${Math.floor(s)} seconds`;
    }

    const mins = Math.floor(s / 60);
    return `${mins} minutes, ${Math.floor(s - mins * 60)} seconds`;
  },
});

Template.signupGap.onDestroyed(() => {
  Meteor.clearInterval(this.interval);
});
