import { Template } from 'meteor/templating';

import './privacy.html';

Template.Privacy.onRendered(function onRendered() {
  this.autorun(() => {
    if (this.subscriptionsReady()) {
      document.title = 'Privacy Policy · SignMeUp';
    }
  });
});
