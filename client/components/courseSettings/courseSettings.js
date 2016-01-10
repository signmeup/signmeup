Template.courseSettings.onRendered(function() {
  // Active State
  var activeCheckbox = $(".ui.checkbox").checkbox();
  activeCheckbox.checkbox("set " + (Template.currentData().active ? "checked" : "unchecked"));
});

Template.courseSettings.events({
  "change .ui.checkbox": function(event) {
    var checked = event.target.checked;
    Courses.update({_id: this._id}, {$set: {active: checked}});
  },

  "submit .js-ta-input": function(event) {
    var email = $(event.target).find("input[type=email]").val();
    Courses.update({_id: this._id}, {$push: {tas: email}});
  }
});

Template.courseSettingsTAs.helpers({
  "tasExist": function() {
    return this.htas.length + this.tas.length > 0;
  }
});