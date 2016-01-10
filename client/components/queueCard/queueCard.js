Template.queueCardLink.helpers({
  queueLink: function() {
    return FlowRouter.path("queue", {courseId: this.course, queueId: this._id}, {});
  }
});

Template.queueCardContent.helpers({
  course: function() {
    return Courses.findOne({name: this.course});
  },
  
  activeTicketCountText: function() {
    var count = _activeTickets(this.tickets).length;
    return (count === 1) ? 
      count + " student in line" :
      count + " students in line";
  },

  waitTimeInMinutes: function() {
    return _timeInMinutes(this.averageWaitTime);
  }
});