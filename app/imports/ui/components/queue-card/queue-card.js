import { Template } from 'meteor/templating';
import GeoPattern from 'geopattern';

import './queue-card.html';

Template.QueueCard.onCreated(function onCreated() {
  this.autorun(() => {
    this.svgPattern = GeoPattern.generate('cs15');
  });
});

Template.QueueCard.helpers({
  svgPatternUrl() {
    return Template.instance().svgPattern.toDataUrl();
  },

  svgPatternColor() {
    return Template.instance().svgPattern.color;
  },
});
