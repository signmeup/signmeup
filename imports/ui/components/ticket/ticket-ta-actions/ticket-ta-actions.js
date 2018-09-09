import { Template } from "meteor/templating";
import { $ } from "meteor/jquery";

import {
  claimTicket,
  releaseTicket,
  markTicketAsMissing,
  markTicketAsDone
} from "/imports/api/tickets/methods";

import "./ticket-ta-actions.html";

Template.TicketTAActions.events({
  "click .js-claim-ticket"(event) {
    event.preventDefault();

    claimTicket.call(
      {
        ticketId: this.ticket._id
      },
      err => {
        if (err) console.log(err);
      }
    );
  },

  "click .js-release-ticket"(event) {
    event.preventDefault();

    releaseTicket.call(
      {
        ticketId: this.ticket._id
      },
      err => {
        if (err) console.log(err);
      }
    );
  },

  "click .js-mark-as-missing"(event) {
    event.preventDefault();

    markTicketAsMissing.call(
      {
        ticketId: this.ticket._id
      },
      err => {
        if (err) console.log(err);
      }
    );
  },

  "click .js-mark-as-done"(event) {
    event.preventDefault();

    const ticket = $(event.target)
      .parents(".js-ticket-holder")
      .children();
    ticket.slideUp(400, () => {
      markTicketAsDone.call(
        {
          ticketId: this.ticket._id
        },
        err => {
          if (err) console.log(err);
        }
      );
    });
  }
});
