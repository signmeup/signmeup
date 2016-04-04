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

// courseSettingsLogs

Template.courseSettingsLogs.onRendered(function() {
  var startTime = moment().subtract(7, "days").startOf("day");
  var endTime = moment().startOf("day");

  this.$(".js-start-time-picker").datetimepicker({
    format: "MM/DD/YYYY",
    defaultDate: startTime,
    maxDate: endTime,
    viewMode: "days"
  }).on("dp.change", function(e) {
    $(".js-end-time-picker").data("DateTimePicker").minDate(e.date)
  });

  this.$(".js-end-time-picker").datetimepicker({
    format: "MM/DD/YYYY",
    useCurrent: false, // See issue #1075
    defaultDate: endTime,
    minDate: startTime,
    maxDate: endTime,
    viewMode: "days"
  }).on("dp.change", function(e) {
    $(".js-start-time-picker").data("DateTimePicker").maxDate(e.date)
  });
});

Template.courseSettingsLogs.events({
  "submit .js-logs-form": function(e) {
    e.preventDefault();

    var course = this.name;
    var type = event.target.type.value;

    var startMoment = $(event.target.startTime).data("DateTimePicker").date();
    var startTime = startMoment.valueOf();
    var endMoment = $(event.target.endTime).data("DateTimePicker").date().endOf("day");
    var endTime = endMoment.valueOf();

    if (type === "queues") {
      Meteor.subscribe("allQueuesInRange", course, startTime, endTime, function() {
        var queues = Queues.find({
          course: course,
          startTime: {$gte: startTime, $lte: endTime}
        }).fetch();
        var jsonString = JSON.stringify(queues, null, 2);
        downloadLogFile(jsonString, course, startMoment, endMoment, "queues");
      });
    } else if (type === "tickets") {
      Meteor.subscribe("allTicketsInRange", course, startTime, endTime, function() {
        var tickets = Tickets.find({
          course: course,
          createdAt: {$gte: startTime, $lte: endTime}
        }, {
          "fields": {
            "notify.email": false,
            "notify.phone": false,
            "notify.carrier": false
          }
        }).fetch();
        var jsonString = JSON.stringify(tickets, null, 2);
        downloadLogFile(jsonString, course, startMoment, endMoment, "tickets");
      });
    }

    return false;
  }
});

function downloadLogFile(contents, course, startMoment, endMoment, type) {
  var blob = new Blob([contents], {type: "application/json;charset=utf-8"});
  var startString = startMoment.format("YYYY-MM-DD");
  var endString = endMoment.format("YYYY-MM-DD");

  saveAs(blob, course + "-" + startString + "-to-" + endString + "-" + type + ".json");
}

// courseSettingsSettings

Template.courseSettingsSettings.helpers({
  isCurrentGap: function(minutes) {
    var signupGapMinutes = parseInt(this.settings.signupGap / (60 * 1000)) || 0;
    return (minutes == signupGapMinutes) ? "selected" : "";
  }
});

Template.courseSettingsSettings.events({
  "change .js-signup-gap-select": function() {
    var ms = event.target.value * 60 * 1000;
    Meteor.call("updateCourseSettings", this.name, {"signupGap": ms});
  }
});
