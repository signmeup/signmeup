import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { ReactiveVar } from "meteor/reactive-var";

import moment from "moment";

import "./ticket-drawer.html";

Template.TicketDrawer.onCreated(function onCreated() {
  const self = this;
  self.claimDuration = new ReactiveVar(0);

  self.autorun(() => {
    const ticket = Template.currentData().ticket;

    if (self.claimDurationInterval)
      Meteor.clearInterval(self.claimDurationInterval);

    if (ticket && ticket.isClaimed()) {
      self.claimDurationInterval = Meteor.setInterval(() => {
        self.claimDuration.set(moment().diff(moment(ticket.claimedAt)));
      }, 1000);
    }
  });
});

Template.TicketDrawer.helpers({
  formattedClaimDuration() {
    const duration = moment.duration(Template.instance().claimDuration.get());
    const seconds = duration.seconds();
    const minutes = duration.minutes();

    function prefixZero(num) {
      return num < 10 ? `0${num}` : `${num}`;
    }

    return `${prefixZero(minutes)}:${prefixZero(seconds)}`;
  }
});
