_.extend($.fn.form.settings.rules, {
  phoneNumber: function(value) {
    // If value is not empty, make sure
    // it's a valid phone number. Empty checks
    // should be made separately.
    var number = value.replace(/\D/g,'');
    return (number.length === 0 || number.length === 10);
  },

  emptyGiven: function(value, checkboxName) {
    // Makes sure the value is not empty
    // provided the checkbox is checked.
    var $form = this.parents("form");
    var $checkbox = $form.find("input[name='" + checkboxName + "'][type='checkbox']");

    if (!$checkbox)
      throw new Error("No checkbox found with name " + checkboxName);

    if ($checkbox.filter(":checked").length > 0) {
      return value.length > 0;
    } else {
      console.log("Checkbox '" + checkboxName + "' not checked, skipping error checking");
      return true;
    }
  }
});