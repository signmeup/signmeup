import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { $ } from "meteor/jquery";

import moment from "moment";

import { SignupGap } from "/imports/lib/both/signup-gap";

import { RestrictedSessions } from "/imports/lib/client/restricted-sessions";

import "./queue-status-dropdown/queue-status-dropdown";
import "./queue-more-dropdown/queue-more-dropdown";

import "./queue-actions.html";

Template.QueueActions.onRendered(() => {
  $(".js-announcements-tooltip-wrapper").tooltip();
});

Template.QueueActions.helpers({
  disableJoinQueue(queue) {
    const nextSignupTime = SignupGap.nextSignupTime(queue, Meteor.userId());
    const disableSignups =
      nextSignupTime && moment(nextSignupTime).diff(moment()) > 0;

    const isDisabled =
      queue.isEnded() ||
      (queue.isRestricted() &&
        !RestrictedSessions.isRestrictedToDevice(queue)) ||
      queue.hasActiveTicketWithUsers([Meteor.userId()]) ||
      disableSignups;
    return isDisabled;
  }
});

Template.QueueActions.events({
  "click .js-show-modal-join-queue"() {
    if (this.queue.requireLogin() && !Meteor.user()) {
      Meteor.loginWithGoogle(
        {
          loginUrlParameters: { hd: "brown.edu" },
          requestPermissions: ["profile", "email"]
        },
        () => {
          if (Meteor.user()) {
            $(".modal-join-queue").modal();
          }
        }
      );
    } else {
      $(".modal-join-queue").modal();
    }
  }
});
