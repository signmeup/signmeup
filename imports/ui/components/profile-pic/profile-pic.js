import { Template } from "meteor/templating";

import "./profile-pic.html";

Template.ProfilePic.onRendered(function onRendered() {
  this.$('[data-toggle="tooltip"]').tooltip();
});
