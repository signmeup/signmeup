// Register collections, methods, helpers, and publications

import { Meteor } from "meteor/meteor";

import "/imports/api/announcements/methods";

import "/imports/api/courses/methods";
import "/imports/api/courses/helpers";

import "/imports/api/locations/methods";

import "/imports/api/queues/methods";
import "/imports/api/queues/helpers";

import "/imports/api/sessions/methods";
import "/imports/api/sessions/helpers";

import "/imports/api/tickets/methods";
import "/imports/api/tickets/helpers";

import "/imports/api/users/users";
import "/imports/api/users/helpers";
import "/imports/api/users/methods";

if (Meteor.isServer) {
  /* eslint-disable global-require */
  require("/imports/api/announcements/server/publications.js");
  require("/imports/api/courses/server/publications.js");
  require("/imports/api/locations/server/publications.js");
  require("/imports/api/queues/server/publications.js");
  require("/imports/api/sessions/server/publications.js");
  require("/imports/api/tickets/server/publications.js");
  require("/imports/api/users/server/publications.js");
  /* eslint-enable global-require */
}
