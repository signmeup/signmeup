import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { ReactiveVar } from "meteor/reactive-var";

import { getData, deleteData } from "/imports/api/users/methods";

import "./settings-data.html";

Template.SettingsData.onCreated(function onCreated() {
  this.getDataSuccessMessage = new ReactiveVar("");
  this.deleteDataSuccessMessage = new ReactiveVar("");

  this.autorun(() => {
    this.subscribe("users.self");
  });
});

Template.SettingsData.helpers({
  getDataSuccessMessage() {
    return Template.instance().getDataSuccessMessage.get();
  },

  deleteDataSuccessMessage() {
    return Template.instance().deleteDataSuccessMessage.get();
  }
});

Template.SettingsData.events({
  "submit #request-data-form"(event, template) {
    event.preventDefault();

    const identifier = Meteor.userId()
    
    getData.call(
      {
        identifier
      },
      (err, personalData) => {
        if (err) console.error(err);
        else {

          //console.log("ok", personalData);
          console.log("Personal data retrieved.");

          template.getDataSuccessMessage.set(personalData);

        }
      }
    );

  }, 
  "submit #delete-data-form"(event, template) {
    event.preventDefault();

    const identifier = Meteor.userId()

    deleteData.call(
      {
        identifier
      },
      err => {
        if (err) console.error(err);
      }
    );

    template.deleteDataSuccessMessage.set("Data deleted.");
  }

});
