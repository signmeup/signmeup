import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';

import moment from 'moment';

import { deleteTicket } from '/imports/api/tickets/methods';

import '/imports/ui/components/ticket/ticket-drawer/ticket-drawer';
import '/imports/ui/components/ticket/ticket-ta-actions/ticket-ta-actions';

import './ticket.html';

Template.Ticket.onCreated(function onCreated() {
  this.autorun(() => {
    const ticket = Template.currentData().ticket;
    this.subscribe('tickets.byId', ticket._id);
    this.subscribe('users.byIds', ticket.studentIds);
    if (ticket.isClaimed()) this.subscribe('users.byIds', [ticket.claimedBy]);
  });
});

Template.Ticket.onRendered(function onRendered() {
  this.autorun(() => {
    const ticketDrawer = $(Template.instance().find('.ticket-drawer'));
    if (Template.currentData().ticket.status === 'claimed') {
      ticketDrawer.slideDown(150);
    } else {
      ticketDrawer.slideUp(150);
    }
  });
});

Template.Ticket.helpers({
  currentUserTicket(ticket) {
    return ticket && ticket.belongsToUser(Meteor.userId());
  },

  currentUserClass(ticket) {
    return (ticket && ticket.belongsToUser(Meteor.userId())) ? 'current-user-ticket' : '';
  },

  studentNames(students) {
    let result = '';

    students.fetch().forEach((student, i) => {
      if (i > 0) {
        result += ', ';
      }

      result += student.fullName();
    });

    return result;
  },

  studentLegalNames(students) {
    return students.fetch().map((student) => student.legalName()).join(', ');
  },

  formattedTimestamp(createdAt) {
    return moment(createdAt).fromNow();
  },

  isClaimedOrMissing(ticket) {
    return ticket.isClaimed() || ticket.isMarkedAsMissing();
  },

  showTicketDrawer(ticket, taView) {
    return taView || (ticket && ticket.belongsToUser(Meteor.userId()));
  },
});

Template.Ticket.events({
  'click .ticket'(event) {
    const target = $(event.target);
    if (target.hasClass('td') || target.hasClass('ticket')) {
      const ticketDrawer = $(Template.instance().find('.ticket-drawer'));
      ticketDrawer.slideToggle(150);
    }
  },

  'click .js-delete-ticket'(event) {
    event.preventDefault();

    const sure = prompt('Are you sure you want to delete this ticket? If yes, type \'DELETE\' in the input below.'); // eslint-disable-line max-len
    if (sure === 'DELETE') {
      deleteTicket.call({
        ticketId: this.ticket._id,
      }, (err) => {
        if (err) console.log(err);
      });
    }
  },
});
