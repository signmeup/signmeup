import { Template } from 'meteor/templating';

import './queue-card.html';

Template.QueueCard.onCreated(function onCreated() {
  this.autorun(() => {
    this.subscribe('tickets.byQueueId', Template.currentData().queue._id);
  });
});

export function svgPatternUrl(queue) {
  let svgPattern = null;
  if (!queue.isEnded()) {
    svgPattern = GeoPattern.generate(queue.course().name);
  } else {
    svgPattern = GeoPattern.generate(queue.course().name, { color: '#d3d3d3' });
  }
  return svgPattern.toDataUrl();
}

export function ticketCount(queue) {
  const activeTicketsCount = queue.activeTickets().count();
  return `${activeTicketsCount} ticket${activeTicketsCount !== 1 ? 's' : ''}`;
}

export function scheduledEndTime(endTime) {
  return moment(endTime).format('LT');
}

Template.QueueCard.helpers({
  hyphenate(name) {
    return name.toLowerCase().replace(' ', '-');
  },
});
