/* Ban Al-Haidari — Web Push Service Worker */

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "Ban Al-Haidari", body: event.data.text() };
  }

  const title = payload.title || "Ban Al-Haidari";
  const options = {
    body: payload.body || "",
    icon: "/favicon.svg",
    badge: "/favicon.svg",
    tag: payload.tag || "bah-notification",
    renotify: true,
    requireInteraction: true,
    vibrate: [200, 100, 200],
    data: { url: payload.url || "/admin" },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const rawUrl = event.notification.data?.url || "/admin";
  // Resolve relative paths to absolute so browsers open the correct page
  const url = rawUrl.startsWith("http") ? rawUrl : self.location.origin + rawUrl;
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (client.url === url && "focus" in client) return client.focus();
      }
      return clients.openWindow(url);
    }),
  );
});

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(clients.claim()));
