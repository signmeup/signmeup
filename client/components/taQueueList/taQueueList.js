/* taQueueList */

Template.taQueueList.onRendered(function() {
  $(this.findAll(".js-ticket-actions")).dropdown();
});

Template.taQueueList.helpers({
  tickets: function() {
    var tickets = this.tickets;

    /* Extend tickets with position */
    for(var i = 0; i < tickets.length; i++) {
      tickets[i]["position"] = i + 1;
    }

    return tickets;
  }
});

/* taQueueTicket */

Template.taQueueTicket.events({
  "click .js-mark-as-done": function(event) {
    console.log(this);
    var ticketId = this._id;
    console.log("Marking as done " + ticketId);
  }
});