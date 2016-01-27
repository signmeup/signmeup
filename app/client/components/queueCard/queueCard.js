Template.queueCardLink.helpers({
  queueLink: function() {
    return FlowRouter.path("queue", {courseId: this.course, queueId: this._id}, {});
  }
});

Template.queueCardContent.onRendered(function() {
  $(this.findAll(".js-status-dropdown")).dropdown();
});

Template.queueCardContent.helpers({
  // Basic Helpers
  course: function() {
    return Courses.findOne({name: this.course});
  },

  locationName: function() {
    return Locations.findOne({_id: this.location}).name;
  },
  
  activeTicketCountText: function() {
    var count = _activeTickets(this.tickets).length;
    return (count === 1) ? 
      count + " student in line" :
      count + " students in line";
  },

  waitTimeInMinutes: function() {
    return _timeInMinutes(this.averageWaitTime);
  },

  // End Time
  showEndTime: function() {
    return (this.endTime && this.status !== "ended");
  },

  readableEndTime: function() {
    return _formatTime(this.endTime, "h:mm A");
  },

  // Status
  readableStatus: function() {
    statuses = {
      "active": "Active",
      "cutoff": "Cut-off",
      "ended": "Ended at " + _formatTime(this.endTime, "h:mm A on MMMM DD")
    };

    return statuses[this.status];
  },

  statusColor: function() {
    colors = {
      "active": "blue",
      "cutoff": "yellow",
      "ended": "red"
    };

    return colors[this.status];
  },

  showQueueStatusDropdown: function() {
    return (authorized.ta(Meteor.userId, this.course) && this.status !== "ended");
  },

  isActive: function() {
    return this.status === "active";
  }
});

Template.queueCardContent.events({
  "click .js-edit-queue": function() {
    
  },

  "click .js-activate": function(e) {
    e.preventDefault();
    Meteor.call("activateQueue", this._id, function(err) {
      if(err) console.log(err);
    });
  },

  "click .js-cutoff": function(e) {
    e.preventDefault();
    Meteor.call("cutoffQueue", this._id, function(err) {
      if(err) console.log(err);
    });
  },

  "click .js-end-now": function(e) {
    e.preventDefault();
    Meteor.call("endQueue", this._id, function(err) {
      if(err) console.log(err);
    });
  }
});