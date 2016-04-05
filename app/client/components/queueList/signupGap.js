Template.signupGap.onCreated(function() {
  var self = this;
  self.signupGap = new ReactiveVar(0);
  self.timeRemaining = new ReactiveVar(0);

  self.autorun(function() {
    // Reactively update signupGap
    debugger;
    var courseSettings = Courses.findOne({name: Template.currentData().course}).settings || {};
    var signupGap = courseSettings.signupGap || 0
    self.signupGap.set(signupGap);

    // Reactively update the timeRemaining for user to sign up again
    if(self.interval)
      Meteor.clearInterval(self.interval);

    var nextSignupTime = _nextSignupTime(Meteor.userId(), Template.currentData()._id);
    if (nextSignupTime === null) return;

    self.interval = Meteor.setInterval(function() {
      self.timeRemaining.set(nextSignupTime - Date.now());
    }, 1000);
  });
});

Template.signupGap.helpers({
  showMessage: function() {
    var timeRemaining = Template.instance().timeRemaining.get();
    var signupGap = Template.instance().signupGap.get();

    var show = (this.status !== "ended"
      && timeRemaining < signupGap
      && timeRemaining > 0);

    // TODO: Come up with a cleaner way to do this?
    // Perhaps with a reactive variable that lives within the scope of queueList?
    var $joinButton = $(".js-show-join-queue");
    if (show) {
      $joinButton.addClass("disabled");
    } else {
      $joinButton.removeClass("disabled");
    }

    return show;
  },

  timeRemaining: function() {
    var ms = Template.instance().timeRemaining.get();
    var s = ms / 1000.0;
    if (s < 60) {
      return Math.floor(s) + " seconds";
    } else {
      var mins = Math.floor(s / 60);
      return mins + " minutes, " + Math.floor(s - mins * 60) + " seconds";
    }
  }
});

Template.signupGap.onDestroyed(function() {
  Meteor.clearInterval(this.interval);
});
