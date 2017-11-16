// Initialize global vendor code here. Other vendor code should be used with
// `import` syntax where needed.

import 'jquery-mask-plugin/dist/jquery.mask.min';
import Popper from 'popper.js';

// Bootstrap requires jQuery and Popper to be available in the window; jquery
// is provided by Meteor, so we don't need to explicitly provide it. Here we
// provide Popper.
window.Popper = Popper;

// We use `require` statements rather than `import` since `import` statements
// are always pulled to the top of the file. However, we explicitly want Popper
// to load first, and then the rest of the Bootstrap files in order.
require('bootstrap/dist/js/bootstrap.js');

require('bootstrap-datepicker/dist/js/bootstrap-datepicker.min.js');
require('bootstrap-datepicker/dist/css/bootstrap-datepicker3.min.css');
