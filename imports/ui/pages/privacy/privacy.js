import { Template } from 'meteor/templating';

import './privacy.html';

Template.Privacy.onRendered(() => {
  document.title = 'Privacy Policy · SignMeUp';
});
