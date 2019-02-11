import { Template } from "meteor/templating";

import "./queue-card.html";

Template.QueueCard.onCreated(function onCreated() {
  this.autorun(() => {
    this.subscribe("tickets.byQueueId", Template.currentData().queue._id);
  });
});

export function ticketCount(queue) {
  const activeTicketsCount = queue.activeTickets().count();
  return `${activeTicketsCount} ticket${activeTicketsCount !== 1 ? 's' : ''}`;
}

Template.QueueCard.helpers({
  hyphenate(name) {
    return name.toLowerCase().replace(" ", "-");
  }
});
