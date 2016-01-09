/**
 * Locations
 *
 * Location:  {
 *    name: STRING,
 *    active: BOOLEAN,
 *    
 *    ips: [STRING],
 *    geo: {
 *      root: GeoJSON,
 *      radius: Number (Meters)
 *    }
 * }
 */

Locations = new Mongo.Collection("locations");

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
