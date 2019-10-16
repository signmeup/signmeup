import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { FlowRouter } from "meteor/kadira:flow-router";
import { Roles } from "meteor/alanning:roles";

import { Queues } from "/imports/api/queues/queues";
import {
  notifyTicketByEmail,
  notifyTicketByText
} from "/imports/api/tickets/methods";

import { WebNotifications } from "/imports/lib/client/web-notifications";
import { Observer } from "/imports/lib/both/observer";

import "/imports/ui/components/queue-header/queue-header";
import "/imports/ui/components/alerts/alert-ending-soon/alert-ending-soon";
import "/imports/ui/components/alerts/alert-signup-gap/alert-signup-gap";
import "/imports/ui/components/queue-actions/queue-actions";
import "/imports/ui/components/queue-alert-restricted-session/queue-alert-restricted-session";
import "/imports/ui/components/queue-table/queue-table";
import "/imports/ui/components/modals/modal-queue-edit/modal-queue-edit";
import "/imports/ui/components/modals/modal-join-queue/modal-join-queue";

import "./queue.html";

Template.Queue.onCreated(function onCreated() {
  this.getQueueId = () => {
    return FlowRouter.getParam("queueId");
  };
  this.getView = () => {
    return FlowRouter.getQueryParam("view");
  };
  this.getQueue = () => {
    return Queues.findOne(this.getQueueId());
  };

  this.autorun(() => {
    this.subscribe("queues.byId", this.getQueueId());

    const queue = this.getQueue();
    if (queue) {
      this.subscribe("courses.byId", queue.courseId);
      this.subscribe("tickets.byQueueId", queue._id);
      this.subscribe("tickets.byCourseId", queue.courseId);
    }
  });
});

// is the current user a TA (or above)?
const isTA = () => {
  if (Template.instance().getView() === "student") {
    return false;
  }

  const queue = Template.instance().getQueue();
  const courseId = queue && queue.courseId;
  if (
    Roles.userIsInRole(Meteor.user(), ["admin", "mta", "hta", "ta"], courseId)
  ) {
    return true;
  }

  return false;
};

Template.Queue.onRendered(function onRendered() {
  WebNotifications.requestPermission();
  this.autorun(() => {
    if (this.subscriptionsReady()) {
      const queue = this.getQueue();
      if (!queue) {
        FlowRouter.go("/404");
        return;
      }

      const studentTicketIndex = queue
        .tickets()
        .fetch()
        .filter(t => t.status === "open")
        .findIndex(t => t.belongsToUser(Meteor.userId()));

      let prefix;
      if (studentTicketIndex === -1) {
        prefix = queue.activeTickets().count();
      } else if (studentTicketIndex === 0) {
        prefix = "you’re next";
      } else {
        prefix = `${studentTicketIndex} ahead`;
      }
      document.title = `(${prefix}) ${queue.course().name} · ${
        queue.name
      } · SignMeUp`;

      // setup notifications
      if (isTA()) {
        Observer.observeAdded(queue.activeTickets(), ticket => {
          WebNotifications.send("A student has joined the queue", {
            body: ticket.question,
            timeout: 5000
          });
        });
      } else {
        Observer.observeAdded(queue.claimedTickets(), ticket => {
          // if ticket created within the past 10 seconds, don't alert
          if (Date.now() - ticket.createdAt < 10000) return;
          if (!ticket.belongsToUser(Meteor.userId())) return;

          WebNotifications.send("Your ticket has been claimed!", {
            timeout: 5000
          });

          if (!ticket.notifications) return;
          if (ticket.notifications.email) {
            notifyTicketByEmail.call(
              {
                ticketId: ticket._id
              },
              err => {
                if (err) console.error(err);
              }
            );
          }
          const phone = ticket.notifications.phone;
          if (phone && phone.number && phone.carrier) {
            notifyTicketByText.call(
              {
                ticketId: ticket._id
              },
              err => {
                if (err) console.error(err);
              }
            );
          }
        });
      }
    }
  });
});

Template.Queue.helpers({
  queue() {
    return Template.instance().getQueue();
  },

  taView() {
    return isTA();
  }
});
