import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { ReactiveVar } from "meteor/reactive-var";
import { $ } from "meteor/jquery";

import moment from "moment";

import { endQueue } from "/imports/api/queues/methods";

import "./alert-ending-soon.html";

Template.AlertEndingSoon.onCreated(function onCreated() {
  const self = this;
  self.threshold = moment.duration(20, "minutes").asMilliseconds();
  self.timeRemaining = new ReactiveVar(0);

  self.autorun(() => {
    const queue = Template.currentData().queue;

    if (self.timeRemainingInterval)
      Meteor.clearInterval(self.timeRemainingInterval);

    self.timeRemainingInterval = Meteor.setInterval(() => {
      self.timeRemaining.set(moment(queue.scheduledEndTime).diff(moment()));
    }, 1000);
  });
});

Template.AlertEndingSoon.helpers({
  endingSoon(queue) {
    const timeRemaining = Template.instance().timeRemaining.get();
    return (
      !queue.isEnded() &&
      timeRemaining > 0 &&
      timeRemaining < Template.instance().threshold
    );
  },

  timeRemaining() {
    return moment.duration(Template.instance().timeRemaining.get()).humanize();
  }
});

Template.AlertEndingSoon.events({
  "click .js-edit-end-time"() {
    $(".modal-queue-edit").modal();
  },

  "click .js-end-now"() {
    const ok = confirm("Are you sure you want to end this queue?");
    if (!ok) return;

    endQueue.call(
      {
        queueId: this.queue._id
      },
      err => {
        if (err) console.log(err);
      }
    );
  }
});

Template.AlertEndingSoon.onDestroyed(() => {
  Meteor.clearInterval(this.timeRemainingInterval);
});
