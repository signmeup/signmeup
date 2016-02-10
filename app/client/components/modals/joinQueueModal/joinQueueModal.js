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

    // Validate form
    $form.find(".ui.error.message .list").empty();
    $form.find(".field").removeClass("error");

    var errors = validateJoinForm(this, name, question, notify);
    if (!_.isEmpty(errors)) {
      $form.find(".ui.error.message").show()
      _.each(errors, function(v, k) {
        $form.find("input[name='" + k + "']").parent(".field").addClass("error");
        $form.find(".ui.error.message .list").append("<li>" + v + "</li>");      
      });

      return false;
    }

    // Create ticket
    Meteor.call("addTicket", this._id, name, question, notify, function(err, res) {
      if (err)
        console.log(err);
      else
        $(".js-join-queue-modal").modal("hide");
    });
  }
});

function validateJoinForm(queue, name, question, notify) {
  var errors = {};
  var courseSettings = Courses.findOne({name: queue.course}).settings;

  // 1. Name
  if (name.length == 0) {
    errors["name"] = "Please enter your name";
  }

  // 2. Question
  if ((courseSettings && courseSettings.questionRequired) && question.length < 1) {
    errors["question"] = "Please specify a question";
  }

  // 3. Notifications
  if (notify.types.length == 0) {
    // Pick a checkbox
  } else {
    if (_.contains(notify.types, "email") && !validEmail(notify.email)) {
      // Enter valid email
    }

    if (_.contains(notify.types, "text") && !validPhoneNumber(notify.phone)) {
      // Enter valid phone
    }

    if (_.contains(notify.types, "text") && !notify.carrier) {
      // Select a carrier
    }
  }

  return errors;
}
