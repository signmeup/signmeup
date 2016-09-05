import { Template } from 'meteor/templating';

import uaParser from 'ua-parser-js';

import './device-card.html';

Template.DeviceCard.helpers({
  icon(userAgent) {
    const ua = uaParser(userAgent);
    if (['iOS', 'Android', 'Windows Phone'].indexOf(ua.os.name) !== -1) {
      return 'phone_iphone';
    }

    return 'laptop_chromebook';
  },

  formattedUserAgent(userAgent) {
    const ua = uaParser(userAgent);
    return `${ua.browser.name} on ${ua.os.name}`;
  },
});
