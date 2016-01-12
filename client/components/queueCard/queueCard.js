Template.queueCardLink.helpers({
  queueLink: function() {
    return FlowRouter.path("queue", {courseId: this.course, queueId: this._id}, {});
  }
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

  readableEndTime: function() {
    var mTime = moment(this.endTime);
    return mTime.format("h:mm A");
  }
});