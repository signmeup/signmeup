Template.signupGap.onCreated(function() {
  var self = this;
  this.timeRemaining = new ReactiveVar(0);

  this.autorun(function() {
    if(this.interval)
      Meteor.clearInterval(this.interval);

    var nextSignupTime = _nextSignupTime(Meteor.userId(), Template.currentData()._id);
    if (typeof nextSignupTime === "undefined") return;

    this.interval = Meteor.setInterval(function() {
      self.timeRemaining.set(nextSignupTime - Date.now());
    }, 1000);
  });
});

Template.signupGap.helpers({
  showMessage: function() {
    var timeRemaining = Template.instance().timeRemaining.get();
    var signupGap = Courses.findOne({name: this.course}).settings.signupGap || (10 * 60 * 1000);

    return (this.status !== "ended"
      && timeRemaining < signupGap
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

Template.signupGap.onDestroyed(function() {
  Meteor.clearInterval(this.interval);
});
