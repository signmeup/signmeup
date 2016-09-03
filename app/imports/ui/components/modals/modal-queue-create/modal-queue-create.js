import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';

import moment from 'moment';

import Courses from '/imports/api/courses/courses.js';
import Locations from '/imports/api/locations/locations.js';

import { createQueue } from '/imports/api/queues/methods.js';

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

Template.ModalQueueCreate.events({
  'submit #js-modal-queue-create-form'(event) {
    event.preventDefault();

    const data = {
      courseId: event.target.courseId.value,
      name: event.target.name.value,
      locationId: event.target.locationId.value,
      scheduledEndTime: new Date(event.target.endTime.value),
    };

    createQueue.call(data, (err) => {
      // TODO: surface ValidationErrors to UI
      if (err) console.error(err);
      $('.modal-queue-create').modal('hide');
    });
  },
});
