/**
 * Announcements
 *
 * Announcement: {
 *    owner: {
 *      id: userId,
 *      name: STRING,
 *    },
 *    type: ("info", "success", "warning", "danger"),
 *    header: STRING,
 *    content: STRING,
 *    createdAt: Number (Milliseconds)
 *  }
 */

Announcements = new Mongo.Collection("announcements");

Announcements.allow({
  insert: function() { return false; },
  update: function() { return false; },
  remove: function() { return false; }
});

Announcements.deny({
  insert: function() { return true; },
  update: function() { return true; },
  remove: function() { return true; }
});
