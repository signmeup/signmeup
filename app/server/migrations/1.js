Migrations.add({
  version: 1,
  up: function() {
    // Courses: add 'createdAt' for courses without a creation time
    Courses.find({createdAt: {$exists: false}}).forEach(function(course) {
      Courses.update(course._id, {$set: {createdAt: 0}});
    });

    // Locations: remove 'ips' and 'geo' from all locations
    Locations.update({}, {$unset: {ips: "", geo: ""}}, {multi: true});

    // Queues: remove 'mode' and 'localSettings' from all queues
    Queues.update({}, {$unset: {mode: "", localSettings: ""}}, {multi: true});

    // Tickets: remove 'missedAt' and 'flag'
    Tickets.update({}, {$unset: {missedAt: "", flag: ""}}, {multi: true});

  },
  down: function() {
    Locations.update({}, {$set: {ips: [], geo: {}}}, {multi: true});
    Queues.update({}, {$set: {mode: "universal", localSettings: {}}}, {multi: true});
    Tickets.update({}, {$set: {missedAt: 0, flag: {}}}, {multi: true});
  }
});
