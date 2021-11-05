import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { ReactiveVar } from "meteor/reactive-var";

import { getData } from "/imports/api/users/methods";

import "./settings-data.html";

Template.SettingsData.onCreated(function onCreated() {
  this.getDataSuccessMessage = new ReactiveVar("");

  this.autorun(() => {
    this.subscribe("users.self");
  });
});

Template.SettingsData.helpers({
  getDataSuccessMessage() {
    return Template.instance().getDataSuccessMessage.get();
  }
});

Template.SettingsData.events({
  "submit #request-data-form"(event, template) {
    event.preventDefault();

    //vvvvvvvthis region needs to be edited to trigger function to get data upon receipt of formvvvvvvv
    //const preferredName = event.target.preferredName.value;
    const identifier = Meteor.userId()
    
    getData.call(
      {
        identifier
      },
      (err, personalData) => {
        if (err) console.error(err);
        else {

          //console.log("ok", personalData);
          console.log("ok");
          //Template.instance().successMessage.set("personalData");
          //template.getDataSuccessMessage.set("personalData");
          template.getDataSuccessMessage.set(personalData);

        }
      }
    );

    
    //^^^^^^^this region needs to be edited to trigger function to get data upon receipt of form^^^^^^^
  }
  //ALSO NEED TO INCLUDE "submit #delete-data-form"(event) {... TO DELETE DATA UPON RECEIPT OF FORM (similar event format to the above one?)
});
//from settings-profile.js -> need to modify for use by settings-data.js