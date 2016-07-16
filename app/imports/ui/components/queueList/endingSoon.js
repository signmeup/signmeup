import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import { _showModal } from '/imports/lib/client/helpers';

Template.endingSoon.onCreated(() => {
  const self = this;
  this.timeRemaining = new ReactiveVar(0);

  this.autorun(() => {
    if (this.interval) {
      Meteor.clearInterval(this.interval);
    }

    const endTime = Template.currentData().endTime;

    this.interval = Meteor.setInterval(() => {
      self.timeRemaining.set(endTime - Date.now());
    }, 1000);
  });
});

Template.endingSoon.helpers({
  showMessage() {
    const timeRemaining = Template.instance().timeRemaining.get();
    const tenMinutes = 10 * 60 * 1000;
    return (this.status !== 'ended'
      && timeRemaining < tenMinutes
      && timeRemaining > 0);
  },

  timeRemaining() {
    const ms = Template.instance().timeRemaining.get();
    const s = ms / 1000.0;
    if (s < 60) {
      return `${Math.floor(s)} seconds`;
    }

    return `${Math.ceil(s / 60)} minutes`;
  },
});

Template.endingSoon.events({
  'click .js-edit-end-time'(event) {
    event.preventDefault();
    _showModal('.js-edit-queue-modal');
  },

  'click .js-end-now'(event) {
    event.preventDefault();
    const ok = confirm('Are you sure you want to end this queue?');
    if (ok) {
      Meteor.call('endQueue', this._id, (err) => {
        if (err) console.log(err);
      });
    }
  },
});

Template.endingSoon.onDestroyed(() => {
  Meteor.clearInterval(this.interval);
});
