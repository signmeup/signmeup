Template.queueList.helpers({
  activeTickets: function() {
    return this.tickets.filter(function(e) {
      return e.status != "done";
    });
  }
});