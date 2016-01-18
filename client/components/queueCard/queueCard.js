Template.queueCardLink.helpers({
  queueLink: function() {
    return FlowRouter.path("queue", {courseId: this.course, queueId: this._id}, {});
  }
});

Template.queueCardContent.onRendered(function() {
  $(this.findAll(".js-status-dropdown")).dropdown();
});

Template.queueCardContent.helpers({
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

  readableStatus: function() {
    statuses = {
      "active": "Active",
      "cutoff": "Cut-off",
      "done": "Ended"
    };

    return statuses[this.status];
  },

  statusColor: function() {
    colors = {
      "active": "blue",
      "cutoff": "yellow",
      "done": "red"
    };

    return colors[this.status];
  },

  showQueueStatusDropdown: function() {
    return (authorized.ta(this.course) && this.status !== "done");
  },

  isActive: function() {
    return this.status === "active";
  },

  readableEndTime: function() {
    var mTime = moment(this.endTime);
    return mTime.format("h:mm A");
  }
});

Template.queueCardContent.events({
  "click .js-edit-queue": function() {
    
  },

  "click .js-activate": function() {
    Meteor.call("activateQueue", this._id, function(err) {
      if(err) console.log(err);
    });
  },

  "click .js-cutoff": function() {
    Meteor.call("cutoffQueue", this._id, function(err) {
      if(err) console.log(err);
    });
  },

  "click .js-end-now": function() {
    Meteor.call("endQueue", this._id, function(err) {
      if(err) console.log(err);
    });
  }
});