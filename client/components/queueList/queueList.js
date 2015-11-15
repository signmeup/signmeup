Template.queueList.helpers({
  activeTickets: function() {
    return this.tickets.filter(function(e) {
      return e.status != "done";
    });
  }
});

Template.queueList.events({
  "click .js-join-queue-btn": function(event) {
    console.log("Join clicked!", event);
    $(".js-join-queue-modal")
      .modal("setting", "transition", "fade up")
      .modal("show");
  }
});