export class Observer {
  // Serves as a wrapper around the Meteor observe function, but ignores
  // existing data at the time the observation is started.
  static observeAdded(dataSource, callback) {
    let initial = true;
    dataSource.observe({
      added: (datum) => {
        // When we first call observe, this function is synchronously called
        // for each existing datum. This hack ignores this initial call.
        if (!initial) callback(datum);
      },
    });
    initial = false;
  }
}
