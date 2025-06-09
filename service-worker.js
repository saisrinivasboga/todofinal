const CACHE_NAME = 'todo-pwa-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/js/all.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});

// Placeholder for push notifications from backend
self.addEventListener('push', function(event) {
  // Example: event.data.json() for payload
  // self.registration.showNotification('To-Do Reminder', { body: 'Task is due!', icon: 'icon-192.png' });
}); 