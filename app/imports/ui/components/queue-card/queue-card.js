import { Template } from 'meteor/templating';

import GeoPattern from 'geopattern';
import moment from 'moment';

import './queue-card.html';

Template.QueueCard.onCreated(function onCreated() {
  this.autorun(() => {
    this.subscribe('tickets.byQueueId', Template.currentData().queue._id);
  });
});

export function svgPatternUrl(queue) {
  const svgPattern = GeoPattern.generate(queue.course().name);
  return svgPattern.toDataUrl();
}

export function ticketCount(queue) {
  const activeTicketsCount = queue.activeTickets().length;
  return `${activeTicketsCount} ticket${activeTicketsCount !== 1 ? 's' : ''}`;
}

export function scheduledEndTime(endTime) {
  return moment(endTime).format('LT');
}

Template.QueueCard.helpers({
  hyphenate(name) {
    return name.toLowerCase().replace(' ', '-');
  },

  svgPatternUrl,
  ticketCount,
  scheduledEndTime,
});
