import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import moment from 'moment';

import './alert-signup-gap.html';

Template.AlertSignupGap.onCreated(function onCreated() {
  const self = this;
  self.threshold = moment.duration(20, 'minutes').asMilliseconds();
  self.timeRemaining = new ReactiveVar(0);

  self.autorun(() => {
    const queue = Template.currentData().queue;

    if (self.timeRemainingInterval) Meteor.clearInterval(self.timeRemainingInterval);

    self.timeRemainingInterval = Meteor.setInterval(() => {
      self.timeRemaining.set(moment(queue.scheduledEndTime).diff(moment()));
    }, 1000);
  });
});

Template.AlertSignupGap.helpers({
  showSignupGap() {
    return true;
  },

  timeRemaining() {
    return moment.duration(5, 'minutes').humanize();
  },
});
