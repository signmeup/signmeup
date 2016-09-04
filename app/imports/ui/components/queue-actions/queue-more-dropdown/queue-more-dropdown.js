import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { Random } from 'meteor/random';

import { restrictSignups } from '/imports/api/queues/methods.js';

import './queue-more-dropdown.html';

Template.QueueMoreDropdown.events({
  'click .js-restrict-signups'(event) {
    event.preventDefault();

    const secret = Random.id();
    restrictSignups.call({
      queueId: this.queue._id,
      name: 'Test Computer',
      userAgent: navigator.userAgent,
      secret,
    }, (err) => {
      if (!err) {
        /* eslint-disable meteor/no-session */
        const restrictedSessionSecrets = Session.get('restrictedSessionSecrets') || {};
        restrictedSessionSecrets[this.queue._id] = secret;

        Session.setPersistent('restrictedSessionSecrets', restrictedSessionSecrets);
        /* eslint-enable meteor/no-session */
      }
    });
  },
});
