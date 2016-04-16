// Ticket Methods

// TODO: Replace input error checks with check()
// TODO: Replace "not-allowed" errors with 403 errors

Meteor.methods({
  addTicket: function(queueId, name, question, notify) {
    var user = Meteor.user();
    if(!user)
      throw new Meteor.Error("no-user");

    var queue = Queues.findOne({_id: queueId});
    if (!queue)
      throw new Meteor.Error("invalid-queue-id");
    if (queue.status === "ended")
      throw new Meteor.Error("queue-ended");
    if (!name)
      throw new Meteor.Error("invalid-name");
    if (!question)
      // TODO: Handle optional question case
      throw new Meteor.Error("invalid-question");
    if (!validateNotify(notify)) {
      throw new Meteor.Error("invalid-notify-options");
    }

    // Disable signing up again if an active ticket exists
    var activeTicketIds = _filterActiveTicketIds(queue.tickets);
    _.each(activeTicketIds, function(id) {
      var ticket = Tickets.findOne(id);
      if (ticket.owner.id === Meteor.userId())
        throw new Meteor.Error("already-signed-up");
    });

    // Make sure student has waited for signupGap
    var nextSignupTime = _nextSignupTime(user._id, queueId);
    if (nextSignupTime !== null && Date.now() < nextSignupTime)
      throw new Meteor.Error("wait-for-signup-gap");

    var ticket = {
      createdAt: Date.now(),
      queueId: queueId,
      course: queue.course,
      owner: {
        id: user._id,
        name: name
      },
      status: "open",

      question: question,
      notify: notify
    }

    var ticketId = Tickets.insert(ticket);
    Queues.update({_id: queueId}, {$push: {tickets: ticketId}});
    console.log("Inserted ticket " + ticketId + " to queue " + queueId);
  },

  notifyTicketOwner: function(ticketId, type) {
    console.log(ticketId, type);
    var ticket = Tickets.findOne(ticketId);
    if(!ticket) throw new Meteor.Error("invalid-ticket-id");

    if (!authorized.ta(this.userId, ticket.course))
      throw new Meteor.Error("not-allowed");

    if (ticket.notify && ticket.notify.types && _.contains(ticket.notify.types, type)) {
      this.unblock();

      if (type === "email") {
        sendEmailNotification(ticketId);
      } else if (type === "text") {
        sendTextNotification(ticketId);
      }
    }
  },

  markTicketAsDone: function(ticketId) {
    var ticket = Tickets.findOne({_id: ticketId});
    if(!ticket)
      throw new Meteor.Error("invalid-ticket-id");
    if(!authorized.ta(this.userId, ticket.course))
      throw new Meteor.Error("not-allowed");

    Tickets.update({
      _id: ticketId
    }, {
      $set: {
        status: "done",
        doneAt: Date.now(),
        ta: {
          id: this.userId,
          email: _getUserEmail(this.userId)
        }
      }
    });

    updateWaitTime(ticketId);
    console.log("Marked ticket " + ticketId + " as done");
  },

  cancelTicket: function(ticketId) {
    var ticket = Tickets.findOne({_id: ticketId});
    if(!ticket)
      throw new Meteor.Error("invalid-ticket-id");

    if(authorized.ta(this.userId, ticket.course) || this.userId === ticket.owner.id) {
      var taObject = ticket.ta || {};
      if (authorized.ta(this.userId, ticket.course)) {
        taObject = {
          id: this.userId,
          email: _getUserEmail(this.userId)
        }
      }

      var setObject = {
        status: "cancelled",
        cancelledAt: Date.now()
      };
      if(!_.isEmpty(taObject))
        _.extend(setObject, taObject);

      Tickets.update({
        _id: ticketId
      }, {
        $set: setObject
      });
    }
  }
});

function validateNotify(notify) {
  if(!notify)
    return false;

  var isValid = true;

  if(notify.types) {
    isValid = isValid && (Array.isArray(notify.types) && _.filter(notify.types, function(t) {
      return !(_.contains(["announce", "email", "text"], t));
    }).length == 0);
  }

  if(_.contains(notify.types, "email") && !notify.email) return false;
  if(_.contains(notify.types, "text") && !notify.phone && !notify.carrier) return false;

  if(notify.email) {
    // Ensure email is valid
    // http://stackoverflow.com/questions/27680544/meteorjs-email-form-validation
    return /^[A-Z0-9'.1234z_%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(notify.email);
  }

  if(notify.phone && notify.carrier) {
    isValid = isValid
      && (notify.phone.replace(/\D/g,'') === notify.phone) && notify.phone.length == 10
      && _.contains(_.values(carriers), notify.carrier);
  }

  return isValid;
}
