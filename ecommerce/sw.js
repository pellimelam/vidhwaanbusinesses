"use strict";

/*
 * Vidhwaan Business Apps
 * Ecommerce Service Worker
 *
 * IMPORTANT:
 * This service worker intentionally does NOT use
 * the Cache API and does NOT cache any resource.
 *
 * Every page, stylesheet, JavaScript file, JSON file,
 * image, manifest, and other network resource is fetched
 * from the network.
 */

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    self.clients.claim()
  );
});
