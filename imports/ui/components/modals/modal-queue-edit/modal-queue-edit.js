import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';

import moment from 'moment';

import { updateQueue } from '/imports/api/queues/methods';
import { locations, endTimes } from
  '/imports/ui/components/modals/modal-queue-create/modal-queue-create';

import './modal-queue-edit.html';

Template.ModalQueueEdit.onCreated(function onCreated() {
  this.autorun(() => {
    this.subscribe('locations.active');
  });
});

Template.ModalQueueEdit.helpers({
  locations,
  endTimes,

  isCurrentLocation(queue, location) {
    if (location && queue) {
      return location._id === queue.locationId;
    }

    return false;
  },

  isCurrentEndTime(queue, time) {
    return queue && queue.scheduledEndTime &&
           moment(queue.scheduledEndTime).isSame(moment(time.ISOString));
  },
});

Template.ModalQueueEdit.events({
  'submit #js-modal-queue-edit-form'(event) {
    event.preventDefault();

    const data = {
      queueId: this.queue._id,
      name: event.target.name.value,
      locationId: event.target.locationId.value,
      scheduledEndTime: new Date(event.target.endTime.value),
    };

    updateQueue.call(data, (err) => {
      if (err) {
        console.error(err);
      } else {
        $('.modal-queue-edit').modal('hide');
      }
    });
  },
});
