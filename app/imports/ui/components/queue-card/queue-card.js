import { Template } from 'meteor/templating';

import GeoPattern from 'geopattern';
import moment from 'moment';

import './queue-card.html';

Template.QueueCard.helpers({
  svgPatternUrl(queue) {
    const svgPattern = GeoPattern.generate(queue.course().name);
    return svgPattern.toDataUrl();
  },

  signupCount(queue) {
    const activeTicketsCount = queue.activeTickets().count();
    return `${activeTicketsCount} signup${activeTicketsCount !== 1 ? 's' : ''}`;
  },

  scheduledEndTime(scheduledEndTime) {
    return moment(scheduledEndTime).format('LT');
  },
});
