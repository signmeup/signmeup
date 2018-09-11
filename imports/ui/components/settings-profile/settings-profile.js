import { Template } from "meteor/templating";
import { ReactiveVar } from "meteor/reactive-var";

import { updateProfile } from "/imports/api/users/methods";

import "./settings-profile.html";

Template.SettingsProfile.onCreated(function onCreated() {
  this.successMessage = new ReactiveVar("");

  this.autorun(() => {
    this.subscribe("users.self");
  });
});

Template.SettingsProfile.helpers({
  successMessage() {
    return Template.instance().successMessage.get();
  }
});

Template.SettingsProfile.events({
  "submit #edit-profile-form"(event) {
    event.preventDefault();

    const preferredName = event.target.preferredName.value;
    updateProfile.call(
      {
        preferredName
      },
      err => {
        if (err) console.error(err);
      }
    );

    Template.instance().successMessage.set("Preferred name saved.");
  }
});
