Template.waitToJoin.onCreated(function() {
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

Template.waitToJoin.helpers({
  showMessage: function() {
    return true;
    
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
      return Math.ceil(s / 60) + " minutes";
    }
  }
});

Template.waitToJoin.onDestroyed(function() {
  Meteor.clearInterval(this.interval);
});
