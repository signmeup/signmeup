Locations = new Mongo.Collection("locations");

Locations.schema = new SimpleSchema({
  name: {type: String}
});

Locations.allow({
  insert: function() { return false; },
  update: function() { return false; },
  remove: function() { return false; }
});

Locations.deny({
  insert: function() { return true; },
  update: function() { return true; },
  remove: function() { return true; }
});
