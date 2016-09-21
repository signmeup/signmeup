import { Template } from 'meteor/templating';

import './footer.html';

Template.Footer.helpers({
  version() {
    return 'Dev';
  },
});
