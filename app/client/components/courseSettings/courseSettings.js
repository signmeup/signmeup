// courseSettings

Template.courseSettings.onRendered(function() {
  // Active State
  var activeCheckbox = this.$(".js-active-checkbox").checkbox();
  activeCheckbox.checkbox("set " + (Template.currentData().active ? "checked" : "unchecked"));
});

Template.courseSettings.events({
  "change .ui.checkbox": function(event) {
    var checked = event.target.checked;
    var active = this.active;

    if(active !== checked)
      Meteor.call("updateCourse", this.name, {"active": checked});
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
  },

  "click .js-delete-course": function() {
    var sure = confirm("Are you sure you want to delete " 
      + this.name + "?\nTHIS IS IRREVERSIBLE.");
    if(sure) {
      Meteor.call("deleteCourse", this.name, function(err) {
        if(err) console.log(err);
      });
    }
  }
});

Template.courseSettingsTAs.helpers({
  "tasExist": function() {
    var htas = this.htas ? this.htas.length : 0;
    var tas = this.tas ? this.tas.length : 0;
    return htas + tas > 0;
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