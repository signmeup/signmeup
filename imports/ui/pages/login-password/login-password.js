import { Template } from "meteor/templating";

import "./login-password.html";

Template.LoginPassword.onRendered(() => {
  document.title = "Login · SignMeUp";
});
