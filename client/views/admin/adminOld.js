Template.adminOld.rendered = function() {
  $(this.find('.ui.checkbox')).checkbox();
};

Template.adminOld.helpers({
  "courses": function() {
    return Courses.find({});
  },

  "queues": function() {
    return Queues.find({});
  }
});

Template.adminOld.events({
  "submit #add-course": function(event) {
    console.log(event);
    event.preventDefault();

    var name = event.target.name.value,
        description = event.target.description.value,
        listserv = event.target.listserv.value,
        active = $(".ui.toggle.checkbox").hasClass("checked"); // BAD

    Courses.insert({
      name: name,
      description: description,
      listserv: listserv,
      active: active,

      htas: [],
      tas: [],

      settings: {},
      createdAt: Date.now()
    });

    $("#add-course"); // TODO: Reset form
  }
});