export class WebNotifications {
  // true iff the browser supports notifications and the user hasn't blocked us
  static canNotify() {
    return 'Notification' in window && Notification.permission !== 'denied';
  }

  // requests permission from the user to send notifications later
  static requestPermission(callback) {
    if (WebNotifications.canNotify() && Notification.permission !== 'granted') {
      Notification.requestPermission(callback);
    }
  }

  static send(message) {
    if (!WebNotifications.canNotify()) return;
    // TODO ask for permission if not granted?
    new Notification(message);
  }
}
