/**
 * Queues
 *
 * Queue: {
 *    name: STRING,
 *    course: STRING,
 *    location: ObjectId,
 *    mode: ("universal", "location", "device") // TODO: Expand this
 *
 *    status: STRING ("active", "cutoff", "done", "cancelled"),
 *    
 *    owner: {
 *      id: userId,
 *      email: STRING
 *    },
 *    startTime: Number (Milliseconds),
 *    endTime: Number (Milliseconds),
 *
 *    localSettings: {
 *      property: value (Overrides from Course)
 *    },
 *    announcements: [{
 *      owner: {
 *        id: userId,
 *        name: STRING,
 *      },
 *      type: ("info", "success", "warning", "danger"),
 *      header: STRING,
 *      content: STRING,
 *      createdAt: Number (Milliseconds)
 *    }],
 *
 *    tickets: [],
 *    averageWaitTime: Number (Milliseconds)
 * }
 */

Queues = new Mongo.Collection("queues");

Queues.allow({
  insert: function() { return false; },
  update: function() { return false; },
  remove: function() { return false; }
});

Queues.deny({
  insert: function() { return true; },
  update: function() { return true; },
  remove: function() { return true; }
});
