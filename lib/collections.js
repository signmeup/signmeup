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

var testLocation = Locations.findOne({name: "Test Location"});
if(!testLocation) {
  Locations.insert({
    name: "Test Location",
    active: true,

    ips: [],
    geo: {}
  });
}

/**
 * Queues
 *
 * Queue: {
 *    name: STRING,
 *    course: STRING,
 *    location: ObjectId,
 *    mode: ("universal", "location", "device") // TODO: Expand this
 *
 *    status: STRING ("active", "cutoff", "ended"),
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
 *      type: ("default", "success", "warning", "danger"),
 *      header: STRING,
 *      content: STRING,
 *      createdAt: Number (Milliseconds)
 *    }],
 *
 *    tickets: [{
 *      filingTime: Number (Milliseconds),
 *      owner: {
 *        id: userId,
 *        name: STRING
 *      },
 *      position: Number,
 *      status: ("default", "done", "missing")
 *
 *      question: STRING,
 *      
 *      notify: {
 *        type: ["announce", "email", "text"],
 *        time: Number (Milliseconds),
 *        email: STRING,
 *        phone: STRING
 *      },
 *      flag: {
 *        flagged: Boolean,
 *        message: STRING,
 *        owner: STRING
 *      }
 *    }],
 *    averageWaitTime: Number (Milliseconds)
 * }
 */
Queues = new Mongo.Collection("queues");

/**
 * Users
 */