import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';

import { Queues } from '/imports/api/queues/queues';

import { RestrictedSessions } from '/imports/lib/client/restricted-sessions';

import { createQueue } from '/imports/api/queues/methods';

import { locations } from '/imports/api/locations/helpers';
import { queueEndTimes } from '/imports/api/queues/helpers';

import './modal-queue-create.html';

Template.ModalQueueCreate.helpers({
  locations,
  queueEndTimes,
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
