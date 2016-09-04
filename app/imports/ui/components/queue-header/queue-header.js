import { Template } from 'meteor/templating';

import {
  svgPatternUrl,
  ticketCount,
  scheduledEndTime }
from '/imports/ui/components/queue-card/queue-card.js';

import './queue-header.html';

Template.QueueHeader.onCreated(function onCreated() {
  this.autorun(() => {
    this.subscribe('courses.byId', Template.currentData().queue.courseId);
    this.subscribe('locations.byId', Template.currentData().queue.locationId);
  });
});

Template.QueueHeader.helpers({
  svgPatternUrl,
  ticketCount,
  scheduledEndTime,
});
