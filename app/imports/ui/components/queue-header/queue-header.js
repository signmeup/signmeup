import { Template } from 'meteor/templating';
import GeoPattern from 'geopattern';

import './queue-header.html';

Template.QueueHeader.onCreated(function onCreated() {
  this.autorun(() => {
    this.svgPattern = GeoPattern.generate('cs15');
  });
});

Template.QueueHeader.helpers({
  svgPatternUrl() {
    return Template.instance().svgPattern.toDataUrl();
  },
});
