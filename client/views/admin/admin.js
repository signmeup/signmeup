Template.admin.rendered = function() {
  $(this.find('.ui.checkbox')).checkbox();
};

Template.admin.helpers({
  "courses": function() {
    return Courses.find({});
  }
});

Template.admin.events({
  "submit #add-course": function(event) {
    console.log(event);
    event.preventDefault();

    var name = event.target.name.value,
        description = event.target.description.value,
        listserv = event.target.listserv.value,
        active = $(".ui.toggle.checkbox").hasClass("checked");

    console.log(name, description, listserv, active);
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
  }
});