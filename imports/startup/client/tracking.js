import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import { UserStatus } from 'meteor/mizzao:user-status';

Tracker.autorun(() => {
  if (Meteor.userId()) {
    try {
      UserStatus.startMonitor({
        idleOnBlur: true,
      });
    } catch (err) {
      // Swallow errors. It takes some time for TimeSync to
      // synchronize with the server, during which errors will
      // be thrown. We just wait it out, and then idle tracking
      // works as expected.
    }
  } else if (UserStatus.isMonitoring()) {
    UserStatus.stopMonitor();
  }
});
