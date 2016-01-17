// courseSettings

Template.courseSettings.onRendered(function() {
  // Active State
  var activeCheckbox = $(".ui.checkbox").checkbox();
  activeCheckbox.checkbox("set " + (Template.currentData().active ? "checked" : "unchecked"));
});

Template.courseSettings.events({
  "change .ui.checkbox": function(event) {
    var checked = event.target.checked;

    // TODO: Change this to a method call, and avoid this firing
    // off when the 'set' statement in onRendered is called.
    Courses.update({_id: this._id}, {$set: {active: checked}});
  },

  "submit .js-ta-input": function(event) {
    var email = $(event.target).find("input[type=email]").val();
    var user = _getUserFromEmail(email);

    if(user && authorized.ta(user._id, this.name)) {
      // TODO: Show proper error message.
      console.log("Already a TA!");
      return false;
    }

    Meteor.call("addTA", this.name, email, function(err) {
      if(err)
        console.log(err);
    });

    return false;
  }
});

Template.courseSettingsTAs.helpers({
  "tasExist": function() {
    return this.htas.length + this.tas.length > 0;
  }
});

// taItem

Template.taItem.onRendered(function() {
  $(this.findAll(".js-ta-dropdown")).dropdown();
});

Template.taItem.events({
  "click .js-change-role": function() {
    var methodName = this.hta ? "switchToTA" : "switchToHTA";
    Meteor.call(methodName, this.course, this.userId, function(err) {
      if(err) console.log(err);
    })
  },

  "click .js-delete": function() {
    Meteor.call("deleteTA", this.course, this.userId, function(err) {
      if(err)
        console.log(err);
    })
  }
});