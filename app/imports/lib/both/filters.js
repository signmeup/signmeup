// Functions

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { _ } from 'meteor/underscore';

import { Queues } from '/imports/api/queues/queues';
import { Tickets } from '/imports/api/tickets/tickets';

export function _activeQueues() {
  return Queues.find({ status: { $nin: ['ended', 'cancelled'] } }).fetch();
}

export function _filterActiveTickets(allTickets) {
  return _.filter(allTickets, (t) => {
    return !(_.contains(['done', 'cancelled'], t.status));
  });
}

export function _filterActiveTicketIds(ticketIds) {
  return _.filter(ticketIds, (id) => {
    const ticket = Tickets.findOne(id);
    return (ticket && !(_.contains(['done', 'cancelled'], Tickets.findOne(id).status)));
  });
}

export function _activeTickets(ticketIds) {
  // Filter IDs and get tickets
  //
  // Note: can't do $in query because Mongo does not
  // guarantee an order for the response. See this bug
  // report for details: https://jira.mongodb.org/browse/SERVER-7528.
  const activeTicketIds = _filterActiveTicketIds(ticketIds);
  const activeTickets = _.map(activeTicketIds, (id) => {
    return Tickets.findOne(id);
  });

  // Extend tickets with position
  for (let i = 0; i < activeTickets.length; i++) {
    activeTickets[i].position = i + 1;
  }

  return activeTickets;
}

// UI Helpers

if (Meteor.isClient) {
  Template.registerHelper('activeQueues', _activeQueues);
  Template.registerHelper('activeTickets', _activeTickets);
}
