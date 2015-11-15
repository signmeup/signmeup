Template.queueCard.helpers({
  course: function() {
    return Courses.findOne({name: this.course});
  },

  activeTicketCount: function() {
    var activeTickets = this.tickets.filter(function(e) {
      return e.status == "active";
    });

    return activeTickets.length;
  },

  waitTimeInMinutes: function() {
    var d = moment.duration(this.waitTime, "milliseconds");
    return Math.floor(d.asMinutes());
  }
});