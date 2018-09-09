import { Session } from "meteor/session";
import { Random } from "meteor/random";
import { _ } from "meteor/underscore";

import { restrictToSession } from "/imports/api/queues/methods";

export class RestrictedSessions {
  static getCurrentSession(queue) {
    const restrictedSessions = Session.get("restrictedSessions") || {};
    return restrictedSessions[queue._id] || {};
  }

  static isSessionForCurrentDevice(queue, sessionId) {
    const currentSession = RestrictedSessions.getCurrentSession(queue);
    return currentSession.sessionId === sessionId;
  }

  static isRestrictedToDevice(queue) {
    const restrictedSessions = Session.get("restrictedSessions") || {};
    const sessionId =
      restrictedSessions[queue._id] && restrictedSessions[queue._id].sessionId;
    return _.contains(queue.settings.restrictedSessionIds, sessionId);
  }

  static restrictToDevice(queue) {
    const secret = Random.id();
    restrictToSession.call(
      {
        queueId: queue._id,
        name: queue.location().name,
        userAgent: navigator.userAgent,
        secret
      },
      (err, sessionId) => {
        if (!err) {
          const restrictedSessions = Session.get("restrictedSessions") || {};
          restrictedSessions[queue._id] = { sessionId, secret };
          Session.setPersistent("restrictedSessions", restrictedSessions);
        }
      }
    );
  }
}
