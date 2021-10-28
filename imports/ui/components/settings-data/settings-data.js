import { Template } from "meteor/templating";
import { ReactiveVar } from "meteor/reactive-var";

import { updateProfile } from "/imports/api/users/methods";

import "./settings-data.html";

Template.SettingsData.onCreated(function onCreated() {
  this.successMessage = new ReactiveVar("");

  this.autorun(() => {
    this.subscribe("users.self");
  });
});

Template.SettingsData.helpers({
  successMessage() {
    return Template.instance().successMessage.get();
  }
});

Template.SettingsData.events({
  "submit #request-data-form"(event) {
    event.preventDefault();

    //vvvvvvvthis region needs to be edited to trigger function to get data upon receipt of formvvvvvvv
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
    //^^^^^^^this region needs to be edited to trigger function to get data upon receipt of form^^^^^^^
  }
  //ALSO NEED TO INCLUDE "submit #delete-data-form"(event) {... TO DELETE DATA UPON RECEIPT OF FORM (similar event format to the above one?)
});
//from settings-profile.js -> need to modify for use by settings-data.js