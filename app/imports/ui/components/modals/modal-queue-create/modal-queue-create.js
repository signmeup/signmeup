import { Template } from 'meteor/templating';

import moment from 'moment';

import Courses from '/imports/api/courses/courses.js';
import Locations from '/imports/api/locations/locations.js';

import './modal-queue-create.html';

Template.ModalQueueCreate.helpers({
  activeCourses() {
    return Courses.find({ active: true });
  },

  locations() {
    return Locations.find();
  },

  endTimes() {
    const endTimes = [];

    const time = moment().add(1, 'hour').startOf('hour');
    while (time <= moment().add(1, 'day').startOf('day')) {
      endTimes.push({
        formattedString: time.format('LT'),
        ISOString: time.toISOString(),
      });
      time.add(30, 'minutes');
    }

    return endTimes;
  },
});
