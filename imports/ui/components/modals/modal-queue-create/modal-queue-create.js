import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';

import moment from 'moment';

import { Locations } from '/imports/api/locations/locations';
import { Queues } from '/imports/api/queues/queues';

import { RestrictedSessions } from '/imports/lib/client/restricted-sessions';

import { createQueue } from '/imports/api/queues/methods';

import './modal-queue-create.html';

export function locations() {
  return Locations.find();
}

export function endTimes() {
  const result = [];

  const time = moment().add(1, 'hour').startOf('hour');
  while (time <= moment().add(1, 'day').startOf('day')) {
    result.push({
      formattedString: time.format('LT'),
      ISOString: time.toISOString(),
    });
    time.add(15, 'minutes');
  }

  return result;
}

Template.ModalQueueCreate.helpers({
  locations,
  endTimes,
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

    createQueue.call(data, (err, queueId) => {
      if (err) {
        // TODO: surface ValidationErrors to UI
        console.error(err);
      } else {
        // If needed, restrict queue to device
        const queue = Queues.findOne(queueId);
        if (queue.course().settings.restrictSessionsByDefault) {
          RestrictedSessions.restrictToDevice(queue);
        }

        $('.modal-queue-create').modal('hide');
      }
    });
  },
});
