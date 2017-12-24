import { Template } from 'meteor/templating';

import './privacy.html';

Template.Privacy.onRendered(function onRendered() {
  document.title = 'Privacy Policy · SignMeUp';
});
