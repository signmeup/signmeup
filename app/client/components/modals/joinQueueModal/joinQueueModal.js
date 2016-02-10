/** 
 * NOTE: Always render the modal with detachable: false, otherwise it gets
 * rendered, then removed from the DOM, then re-rendered within the dimmer by
 * Semantic. In the process, the Blaze event handlers get lost.
 */

Template.joinQueueModal.onRendered(function() {
  // Initialize carriers
  this.$(".js-carrier-dropdown").dropdown();
});

Template.joinQueueModal.events({
  /* TODO: Validate form inputs on blur */

  "change .js-join-queue-form input[type=checkbox]": function(event) {
    var $helper = $("." + $(event.target).data("helper"));
    $helper.toggleClass("hidden");

    if(!$helper.hasClass("hidden")) {
      $helper.find(".ui.input input").focus();
    }
  },

  "click .js-submit-join-queue-form": function(event) {
    $(".js-join-queue-form").submit();
  },

  "submit .js-join-queue-form": function(event) {
    event.preventDefault();
    var $form = $(event.target);

    // Validate form
    var isValid = validateJoinForm(event);
    if (!isValid) return false;

    var name = event.target.name.value;
    var question = event.target.question.value;

    // Parse notification types
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
      if (err)
        console.log(err);
      else
        $(".js-join-queue-modal").modal("hide");
    });
  }
});

function validateJoinForm(event) {
  var $form = $(event.target);
  var $error = $form.find(".ui.error.message");
  var $fields = $form.find(".field");

  $error.find(".list").empty();
  $fields.removeClass("error");

  var name = event.target.name.value;
  var question = event.target.question.value;

  var errors = [];

  if (name.length == 0) {
    $form.find("input[name='name']").parent(".field").addClass("error");
    errors.push("Please enter your name");
  }

  if (errors) {
    $error.show()
    _.each(errors, function(e) {
      $form.find(".ui.error.message .list").append("<li>" + e + "</li>");      
    });

    return false;
  } else {
    return true;
  }
}
