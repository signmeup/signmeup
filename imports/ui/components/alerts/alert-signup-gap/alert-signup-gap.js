import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import moment from 'moment';

import { SignupGap } from '/imports/lib/both/signup-gap.js';

import './alert-signup-gap.html';

Template.AlertSignupGap.onCreated(function onCreated() {
  const self = this;
  self.timeRemaining = new ReactiveVar(0);

  self.autorun(() => {
    const queue = Template.currentData().queue;
    const nextSignupTime = SignupGap.nextSignupTime(queue, Meteor.userId());

    // If nextSignupTime is null, the user cannot signup. In this case, we avoid
    // showing the alert message.
    if (!nextSignupTime) {
      return;
    }

    if (self.timeRemainingInterval) Meteor.clearInterval(self.timeRemainingInterval);

    self.timeRemainingInterval = Meteor.setInterval(() => {
      self.timeRemaining.set(moment(nextSignupTime).diff(moment()));
    }, 1000);
  });
});

Template.AlertSignupGap.helpers({
  showSignupGap() {
    return Meteor.user() && Template.instance().timeRemaining.get() > 0;
  },

  timeRemaining() {
    return moment.duration(Template.instance().timeRemaining.get()).humanize();
  },
});

Template.AlertSignupGap.onDestroyed(() => {
  Meteor.clearInterval(this.timeRemainingInterval);
});
