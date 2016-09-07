// queueList

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';
import { _ } from 'meteor/underscore';

import { Queues } from '/imports/api/queues/queues';

import { _activeTickets } from '/imports/lib/both/filters';
import { _showModal } from '/imports/lib/client/helpers';

import './queueList.html';

// Sets or removes the cutoff marker appropriately.
// Call from within a this.autorun within the onRendered
// function of a template.
export function _setCutoffMarker(instance, data, colspan) {
  // Remove any existing markers
  instance.$('.cutoff-marker').remove();

  if (data.status === 'cutoff') {
    const activeTickets = _activeTickets(data.tickets);

    // If no active tickets, let the template
    // show a message about being cutoff. We only show the
    // cutoff marker when there is at least one active ticket.
    if (activeTickets.length === 0) return;

    const activeTimes = _.map(activeTickets, (t) => {
      return t.createdAt;
    });
    activeTimes.push(data.cutoffTime);
    activeTimes.sort();

    // Calculate where to insert the cutoff marker
    const cutoffIndex = activeTimes.indexOf(data.cutoffTime);

    const cutoffMarker = $(`<tr class="cutoff-marker"><td colspan="${colspan}">Cutoff</td></tr>`);

    // Insert into DOM
    if (cutoffIndex === 0) {
      instance.$('tbody').prepend(cutoffMarker);
    } else {
      const precedingTicket = instance.$(`tr:eq(${(cutoffIndex - 1)})`);
      cutoffMarker.insertAfter(precedingTicket);
    }
  }
}

Template.queueList.onRendered(function queueListOnRendered() {
  const self = this;

  // Reactively set the cutoff marker. This runs each
  // time the status or activeTickets changes.
  self.autorun(() => {
    _setCutoffMarker(self, Template.currentData(), 3);
  });
});

Template.queueList.helpers({
  disableJoin() {
    const ended = (this.status === 'ended');

    const activeTickets = _activeTickets(this.tickets);
    const ownerIds = _.map(activeTickets, (t) => {
      return t.owner.id;
    });
    const alreadySignedUp = _.contains(ownerIds, Meteor.userId());

    return (ended || alreadySignedUp) ? 'disabled' : '';
  },
});

Template.queueList.events({
  'click .js-show-join-queue'() {
    if (Meteor.user()) {
      _showModal('.js-join-queue-modal', 'textarea[name="question"]');
    } else {
      Meteor.loginWithSaml(() => {
        if (Meteor.user()) {
          _showModal('.js-join-queue-modal', 'textarea[name="question"]');
        }
      });
    }
  },
});

// queueTicket

Template.queueTicket.helpers({
  isOwner() {
    return this.owner.id === Meteor.userId();
  },

  waitTime() {
    const queue = Queues.findOne(this.queueId);
    const timeSoFar = Date.now() - this.createdAt;
    const timeRemaining = queue.averageWaitTime - timeSoFar;

    if (timeRemaining < 0) {
      // Student has waited longer than average
      return '—';
    }

    return `${Math.ceil(timeRemaining / (60 * 1000))} minutes`;
  },
});

Template.queueTicket.events({
  'click .js-edit-ticket'() {
    // TODO: Implement edit functionality
    return;
  },

  'click .js-cancel-ticket'() {
    const ok = confirm('Are you sure you want to cancel your signup?');
    if (ok) Meteor.call('cancelTicket', this._id);
  },
});
