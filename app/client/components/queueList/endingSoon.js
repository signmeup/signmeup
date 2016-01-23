Template.endingSoon.onCreated(function() {
  var self = this;
  this.timeRemaining = new ReactiveVar(0);

  this.autorun(function() {
    if(this.interval)
      Meteor.clearInterval(this.interval);

    var endTime = Template.currentData().endTime;

    this.interval = Meteor.setInterval(function() {
      self.timeRemaining.set(endTime - Date.now());
    }, 1000);
  });
});

Template.endingSoon.helpers({
  showMessage: function() {
    var timeRemaining = Template.instance().timeRemaining.get();
    var tenMinutes = 10 * 60 * 1000;
    return (this.status !== "ended" 
      && timeRemaining < tenMinutes
      && timeRemaining > 0);
  },

  timeRemaining: function() {
    var ms = Template.instance().timeRemaining.get();
    var s = ms / 1000.0;
    if (s < 60) {
      return Math.floor(s) + " seconds";
    } else {
      return Math.floor(s / 60) + " minutes";
    }
  }
});

Template.endingSoon.events({
  "click .js-edit-end-time": function(e) {
    e.preventDefault();
    return;
  },

  "click .js-end-now": function(e) {
    e.preventDefault();
    Meteor.call("endQueue", this._id, function(err) {
      if(err) console.log(err);
    });
  }
});

Template.endingSoon.onDestroyed(function() {
  Meteor.clearInterval(this.interval);
});