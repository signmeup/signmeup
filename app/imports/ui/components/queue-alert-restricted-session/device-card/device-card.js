import { Template } from 'meteor/templating';

import uaParser from 'ua-parser-js';

import './device-card.html';

Template.DeviceCard.helpers({
  formattedUserAgent(userAgent) {
    const ua = uaParser(userAgent);
    return `${ua.browser.name} on ${ua.os.name}`;
  },
});
