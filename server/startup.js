Meteor.startup(function() {
  /* Startup Code */
  initializeCollections();
});

function initializeCollections() {
  /* Courses */
  var testCourse = Courses.findOne({name: "cs00"});
  if(!testCourse) {
    Courses.insert({
      name: "cs00",
      description: "Test Course",
      listserv: "cs00tas@cs.brown.edu",
      active: true,

      htas: [],
      tas: [],

      settings: {},
      createdAt: Date.now()
    });
  }

  /* Queues */
  var testQueue = Queues.findOne({name: "Test Queue", course: "cs00"});
  if(!testQueue) {
    Queues.insert({
      name: "Test Queue",
      course: "cs00",
      location: "CIT 227",

      status: "active",

      owner: {},

      startTime: Date.now(),
      endTime: null,

      localSettings: {},
      announcements: [],

      tickets: [],
      averageWaitTime: 0
    });
  }
}