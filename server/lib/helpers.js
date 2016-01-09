_getUser = function(id) {
  return Meteor.users.findOne({_id: id});
};
