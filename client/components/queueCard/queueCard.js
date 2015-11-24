Template.queueCardLink.helpers({
  queueLink: function() {
    return FlowRouter.path("queue", {courseId: this.course, queueId: this._id}, {});
  }
});

Template.queueCardContent.helpers({
  course: function() {
    return Courses.findOne({name: this.course});
  },
  
  activeTicketCount: function() {
    var activeTickets = this.tickets.filter(function(e) {
      return e.status != "done";
    });

    return activeTickets.length;
  },

  waitTimeInMinutes: function() {
    var d = moment.duration(this.waitTime, "milliseconds");
    return Math.floor(d.asMinutes());
  }
});