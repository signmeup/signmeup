// taQueueList

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { $ } from 'meteor/jquery';
import { _ } from 'meteor/underscore';

import { _activeTickets } from '/imports/lib/both/filters';

import { _setCutoffMarker } from '/imports/ui/components/queueList/queueList';

import './taQueueList.html';

Template.taQueueList.onCreated(function taQueueListOnCreated() {
  const self = this;
  self.timeRemaining = new ReactiveVar(0);

  self.autorun(() => {
    if (self.interval) Meteor.clearInterval(self.interval);

    const endTime = Template.currentData().endTime;

    self.interval = Meteor.setInterval(() => {
      self.timeRemaining.set(endTime - Date.now());
    }, 1000);
  });
});

Template.taQueueList.onRendered(function tqQueueListOnRendered() {
  const self = this;

  // Reactively update the title.
  self.autorun(() => {
    const cd = Template.currentData();
    const activeTickets = _activeTickets(cd.tickets).length;
    document.title = `(${activeTickets}) ${cd.course} · ${cd.name}`;
  });

  // Reactively update the cutoff marker.
  // Function defined in queueList.js.
  self.autorun(() => {
    _setCutoffMarker(self, Template.currentData(), 6);
  });
});

Template.taQueueList.helpers({
  disableActions: () => {
    const ended = (this.status === 'ended');
    const activeTicketsExist = _activeTickets(this.tickets).length;
    return (!ended && activeTicketsExist) ? '' : 'disabled';
  },
});

Template.taQueueList.events({
  'click .js-shuffle-queue': () => {
    const ok = confirm('Are you sure you want to shuffle all active tickets?');
    if (ok) {
      Meteor.call('shuffleQueue', this._id, (err) => {
        if (err) console.log(err);
      });
    }
  },

  'click .js-clear-all': () => {
    const ok = confirm('Are you sure you want to cancel all active tickets?');
    if (ok) {
      Meteor.call('clearQueue', this._id, (err) => {
        if (err) console.error(err);
      });
    }
  },
});

// taQueueTicket

function notificationSent(ticket, type) {
  return (ticket.notify && ticket.notify.sent && _.contains(ticket.notify.sent, type));
}

Template.taQueueTicket.onRendered(function taQueueTicketOnRendered() {
  $(this.findAll('.js-ticket-actions')).dropdown();
});

Template.taQueueTicket.helpers({
  showNotifyButton(type) {
    return (this.notify && this.notify.types && _.contains(this.notify.types, type));
  },

  notifyButtonColor(type) {
    return notificationSent(this, type) ? 'green' : '';
  },

  notificationSent(type) {
    return notificationSent(this, type);
  },
});

Template.taQueueTicket.events({
  'click .js-email-student': () => {
    const $icon = $('.js-email-student .mail.icon');
    const iconClasses = $icon.attr('class');

    $icon.removeClass().addClass('notched circle loading icon');

    Meteor.call('notifyTicketOwner', this._id, 'email', (err) => {
      if (err) console.log(err);
      $icon.removeClass().addClass(iconClasses);
    });
  },

  'click .js-text-student': () => {
    const $icon = $('.js-text-student .comment.icon');
    const iconClasses = $icon.attr('class');

    $icon.removeClass().addClass('notched circle loading icon');

    Meteor.call('notifyTicketOwner', this._id, 'text', (err) => {
      if (err) console.log(err);
      $icon.removeClass().addClass(iconClasses);
    });
  },

  'click .js-mark-as-done': () => {
    Meteor.call('markTicketAsDone', this._id, (err) => {
      if (err) console.log(err);
    });
  },

  'click .js-cancel-ticket': () => {
    const ok = confirm('Are you sure you want to cancel this signup?');
    if (ok) Meteor.call('cancelTicket', this._id);
  },
});
