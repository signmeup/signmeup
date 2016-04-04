/**
 * NOTE: Always render the modal with detachable: false, otherwise it gets
 * rendered, then removed from the DOM, then re-rendered within the dimmer by
 * Semantic. In the process, the Blaze event handlers get lost.
 */

Template.joinQueueModal.onRendered(function() {
  // Initialize phone number
  $("input[name='phone']").mask('(000) 000-0000');

  // Initialize carriers
  this.$(".js-carrier-dropdown").dropdown();

  // Validation
  this.$(".js-join-queue-form").form({
    "fields": {
      name: {
        rules: [{
          type: "empty",
          prompt: "Please enter a name"
        }]
      },

      question: {
        rules: [{
          type: "empty",
          prompt: "Please enter a question"
        }]
      },

      emailAddress: {
        rules: [{
          type: "email",
          prompt: "Please enter valid email address"
        }, {
          type: "emptyGiven[email]",
          prompt: "Email address cannot be empty"
        }]
      },

      phone: {
        rules: [{
          type: "phoneNumber",
          prompt: "Please enter valid phone number"
        }, {
          type: "emptyGiven[text]",
          prompt: "Phone number cannot be empty"
        }]
      },

      carrier: {
        rules: [{
          type: "emptyGiven[text]",
          prompt: "Please select a carrier"
        }]
      }
    }
  });
});

Template.joinQueueModal.events({

  "change .js-join-queue-form input[type=checkbox]": function(event) {
    // Show helper
    var $helper = $("." + $(event.target).data("helper"));
    $helper.toggleClass("hidden");

    if(!$helper.hasClass("hidden")) {
      $helper.find(".ui.input input").focus();
    }

    // Revalidate form if a checkbox has been unchecked
    // This helps remove errors if a user first caused an
    // error and now chooses not to use that notification option.
    var checked = $(event.target).is(":checked");
    if (!checked) {
      $(".js-join-queue-form").form("validate form");
    }
  },

  "click .js-submit-join-queue-form": function(event) {
    $(".js-join-queue-form").submit();
  },

  "submit .js-join-queue-form": function(event) {
    event.preventDefault();
    var $form = $(event.target);

    // Parse inputs
    var name = event.target.name.value;
    var question = event.target.question.value;
    var notify = {}
    var types = [];

    var $checkboxes = $form.find("input[type='checkbox']");
    $checkboxes.each(function() {
      if (this.checked) {
        types.push(this.name);
        if(this.name === "email") {
          notify["email"] = event.target.emailAddress.value;
        } else if(this.name === "text") {
          notify["phone"] = event.target.phone.value.replace(/\D/g,''); // Strip non-numeric characters
          notify["carrier"] = event.target.carrier.value;
        }
      }
    });

    notify["types"] = types;

    // Create ticket
    Meteor.call("addTicket", this._id, name, question, notify, function(err, res) {
      if (err) {
        console.log(err);
      } else {
        $(".js-join-queue-modal").modal("hide");
        $form.find("textarea[name='question']").val("");
      }
    });
  }
});
