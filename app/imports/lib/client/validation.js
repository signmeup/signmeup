import { $ } from 'meteor/jquery';
import { _ } from 'meteor/underscore';

_.extend($.fn.form.settings.rules, {
  phoneNumber(value) {
    // If value is not empty, make sure
    // it's a valid phone number. Empty checks
    // should be made separately.
    const number = value.replace(/\D/g, '');
    return (number.length === 0 || number.length === 10);
  },

  emptyGiven(value, checkboxName) {
    // Makes sure the value is not empty
    // provided the checkbox is checked.
    const $form = this.parents('form');
    const $checkbox = $form.find(`input[name='${checkboxName}'][type='checkbox']`);

    if (!$checkbox) {
      throw new Error(`No checkbox found with name ${checkboxName}`);
    }

    if ($checkbox.filter(':checked').length > 0) {
      return value.length > 0;
    }

    console.log(`Checkbox ${checkboxName} not checked, skipping error checking`);
    return true;
  },
});
