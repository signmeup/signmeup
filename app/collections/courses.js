/**
 * Courses
 *
 * Course: {
 *    name: STRING,
 *    description: STRING,
 *    listserv: STRING,
 *    active: BOOLEAN,
 *
 *    htas: [userId],
 *    tas: [userId],
 *
 *    settings: {
 *      
 *    },
 *    createdAt: Number (Milliseconds)
 * }
 */

Courses = new Mongo.Collection("courses");

Courses.allow({
  insert: function() { return false; },
  update: function() { return false; },
  remove: function() { return false; }
});

Courses.deny({
  insert: function() { return true; },
  update: function() { return true; },
  remove: function() { return true; }
});
