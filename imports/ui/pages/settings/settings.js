import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { Roles } from "meteor/alanning:roles";

import "/imports/ui/components/settings-courses/settings-courses";
import "/imports/ui/components/settings-locations/settings-locations";
import "/imports/ui/components/settings-profile/settings-profile";

import "./settings.html";

Template.Settings.onRendered(function onRendered() {
  this.autorun(() => {
    if (this.subscriptionsReady()) {
      document.title = "Settings · SignMeUp";
    }
  });
});

Template.Settings.helpers({
  availableSettings() {
    if (!Meteor.user()) return [];

    let settings = [
      {
        id: "profile",
        name: "Profile",
        template: "SettingsProfile"
      }
    ];

    if (
      Roles.userIsInRole(Meteor.userId(), ["admin", "mta"]) ||
      Meteor.user()
        .htaCourses()
        .count() > 0
    ) {
      const superSettings = [
        {
          id: "courses",
          name: "Courses",
          template: "SettingsCourses"
        },
        {
          id: "locations",
          name: "Locations",
          template: "SettingsLocations"
        }
      ];
      settings = superSettings.concat(settings);
    }

    settings[0].active = true;
    return settings;
  }
});
