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
 *    status: STRING ("active", "cutoff", "done"),
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
 *      createdAt: Number (Milliseconds),
 *      owner: {
 *        id: userId,
 *        name: STRING
 *      },
 *      status: ("default", "missing", "done")
 *
 *      question: STRING,
 *      
 *      notify: {
 *        types: ["announce", "email", "text"],
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