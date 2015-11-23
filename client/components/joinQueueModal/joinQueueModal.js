/** 
 * NOTE: Always render the modal with detachable: false, otherwise it gets
 * rendered, then removed from the DOM, then re-rendered within the dimmer by
 * Semantic. In the process, the Blaze event handlers get lost.
 */

Template.joinQueueModal.events({
  /* TODO: Validate form inputs on blur */

  "change .js-join-queue-form input[type=checkbox]": function(event) {
    var $helper = $("." + $(event.target).data("helper"));
    $helper.toggleClass("hidden");

    if(!$helper.hasClass("hidden")) {
      $helper.find("input").focus();
    }
  },

  "click .js-submit-join-queue-form": function(event) {
    $(".js-join-queue-form").submit();
  },

  "submit .js-join-queue-form": function(event) {
    event.preventDefault();    
    var $form = $(event.target);

    /* Validate form */
    var valid = validateForm();
    if(!valid) return false;

    /* Parse notification types */
    var notify = {}
    var types = [];

    var $checkboxes = $form.find("input[type='checkbox']");
    $checkboxes.each(function() {
      if (this.checked) {
        types.push(this.name);
        if(this.name === "email") {
          notify["email"] = event.target.emailAddress.value;
        } else if(this.name === "phone") {
          notify["phone"] = event.target.phoneNumber.value;
        }
      }
    });

    notify["types"] = types;

    /* Create ticket */
    var ticket = {
      /* TODO: Check safety? */
      createdAt: Date.now(),
      owner: {
        name: event.target.name.value,
      },
      status: "default",

      question: event.target.question.value,

      notify: notify,
      flag: {
        flagged: false
      }
    }

    Queues.update({_id: this._id}, {$push: {tickets: ticket}});
    $(".js-join-queue-modal").modal("hide");
    // return false;
  }
});

function validateForm() {
  /* TODO: Validate form */
  return true;
}