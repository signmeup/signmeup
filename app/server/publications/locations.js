// Locations Publications

Meteor.publish("locations", function() {
  return Locations.find({});
});