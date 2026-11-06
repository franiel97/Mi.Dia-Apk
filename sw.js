/* Mi.Día - service worker: cache offline, clique nas notificações e avisos agendados (melhor esforço) */
var VERSION = 'mi-dia-v7';
var STORE = 'mi-dia-store-v1';
var PRECACHE = ['./', 'index.html', 'manifest.webmanifest',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png',
  'js/lang/core.js',
  'js/lang/en.js',
  'js/lang/es.js',
  'js/rules/points.js',
  'js/rules/levels.js',
  'js/rules/achievements.js',
  'js/rules/unlocks.js',
  'js/rules/texts.js',
  'js/boot/storage-scope.js',
  'js/boot/anti-flash.js',
  'js/utils/whatsapp.js',
  'js/core/translate.js',
  'js/core/dates.js',
  'js/features/filters.js',
  'js/core/colors.js',
  'js/core/checklist.js',
  'js/core/state.js',
  'js/ui/pop-x.js',
  'js/features/game/engine.js',
  'js/features/game/effects.js',
  'js/features/game/unlocks.js',
  'js/features/game/ui.js',
  'js/features/logs.js',
  'js/core/persist.js',
  'js/ui/header-tray.js',
  'js/ui/board.js',
  'js/ui/color-popover.js',
  'js/ui/view.js',
  'js/ui/calendar.js',
  'js/core/actions.js',
  'js/features/dash/stats.js',
  'js/features/dash/popups.js',
  'js/features/dash/render.js',
  'js/features/dash/pickers.js',
  'js/ui/dialogs.js',
  'js/features/copy-week.js',
  'js/ui/day-menu.js',
  'js/ui/day-picker.js',
  'js/ui/modal.js',
  'js/ui/color-picker.js',
  'js/ui/editors.js',
  'js/ui/drag.js',
  'js/features/look.js',
  'js/ui/fx.js',
  'js/features/notifications.js',
  'js/features/push.js',
  'js/features/notif-toggle.js',
  'js/features/notif-history.js',
  'js/features/accounts.js',
  'js/features/cloud/core.js',
  'js/features/cloud/sync.js',
  'js/features/cloud/auth.js',
  'js/features/profile.js',
  'js/features/backup.js',
  'js/features/install.js',
  'js/features/tutorial.js',
  'js/features/install-help.js',
  'js/features/notif-click.js',
  'js/boot/init.js',
  'css/components/game-panel.css',
  'css/base/touch.css',
  'css/components/game-intro.css',
  'css/components/unlocks.css',
  'css/themes/floresta-vars.css',
  'css/themes/caderno-vars.css',
  'css/themes/floresta-caderno.css',
  'css/components/day-actions.css',
  'css/components/game-badge.css',
  'css/themes/dash-colors.css',
  'css/components/game-toast.css',
  'css/responsive/header-small.css',
  'css/components/tutorial.css',
  'css/base/tap-highlight.css',
  'css/themes/padrao.css',
  'css/themes/fofo.css',
  'css/themes/tech.css',
  'css/themes/glass-vars.css',
  'css/base/dark-mode.css',
  'css/layout/page.css',
  'css/layout/header.css',
  'css/components/clock.css',
  'css/components/tray.css',
  'css/components/filters.css',
  'css/components/board.css',
  'css/components/drag.css',
  'css/components/picker.css',
  'css/layout/view-toggle.css',
  'css/components/calendar-head.css',
  'css/components/popovers.css',
  'css/components/calendar-grid.css',
  'css/components/picker-days.css',
  'css/components/look-panel.css',
  'css/components/board-paging.css',
  'css/animations/skins.css',
  'css/themes/feminine.css',
  'css/themes/masculine.css',
  'css/themes/glass.css',
  'css/components/editor.css',
  'css/components/settings-tabs.css',
  'css/components/dash.css',
  'css/animations/card-exit.css',
  'css/components/card-nocolor.css',
  'css/animations/mass-delete.css',
  'css/animations/motion.css',
  'css/responsive/mobile.css',
  'css/responsive/clock-header.css',
  'css/components/confirm-lock.css',
  'css/components/color-pop.css',
  'css/responsive/dock.css',
  'css/responsive/calendar-header.css',
  'css/components/copy-week-btn.css',
  'css/components/pf-points.css',
  'js/features/game/history.js',
  'css/components/pf-points.css',
  'js/features/game/history.js'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) {
    return Promise.all(PRECACHE.map(function (u) { return c.add(u).catch(function () {}); }));
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== VERSION && k !== STORE; })
      .map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== location.origin) return;           /* fontes e outros domínios: direto da rede */
  if (req.mode === 'navigate') {                         /* página: rede primeiro, cache se estiver offline */
    e.respondWith(fetch(req).then(function (res) {
      var copy = res.clone(); caches.open(VERSION).then(function (c) { c.put('index.html', copy); });
      return res;
    }).catch(function () { return caches.match('index.html').then(function (r) { return r || caches.match('./'); }); }));
    return;
  }
  e.respondWith(caches.open(VERSION).then(function (c) {  /* demais arquivos: cache e atualiza em segundo plano */
    return c.match(req).then(function (hit) {
      var net = fetch(req).then(function (res) { if (res && res.ok) c.put(req, res.clone()); return res; }).catch(function () { return hit; });
      return hit || net;
    });
  }));
});

/* ---- avisos agendados: a página envia a agenda; o sistema acorda o SW (periodicsync) quando permitir ---- */
function keyReq(k) { return new Request(self.registration.scope + '__' + k); }
function readJ(k, d) {
  return caches.open(STORE).then(function (c) { return c.match(keyReq(k)); })
    .then(function (r) { return r ? r.json() : d; }).catch(function () { return d; });
}
function writeJ(k, v) {
  return caches.open(STORE).then(function (c) {
    return c.put(keyReq(k), new Response(JSON.stringify(v), { headers: { 'Content-Type': 'application/json' } }));
  });
}
function checkDue() {
  var now = Date.now();
  return readJ('sched', []).then(function (items) {
    var keep = [], due = [];
    items.forEach(function (it) {
      if (it.until <= now) return;                       /* já passou da hora */
      if (it.at <= now) due.push(it); else keep.push(it);
    });
    return writeJ('sched', keep).then(function () {
      return Promise.all(due.map(function (it) {
        return self.registration.showNotification(it.title, {
          body: it.body, tag: it.tag, icon: 'icons/icon-192.png', badge: 'icons/icon-192.png',
          data: { key: it.key }, actions: [{ action: 'open', title: 'Abrir' }]
        });
      })).then(function () {
        if (!due.length) return;
        return self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (cl) {
          if (cl.length) { cl.forEach(function (c) { c.postMessage({ type: 'shown-list', items: due }); }); return; }
          return readJ('shown', []).then(function (st) { return writeJ('shown', st.concat(due).slice(-50)); });
        });
      });
    });
  });
}
self.addEventListener('periodicsync', function (e) {
  if (e.tag === 'mi-dia-check') e.waitUntil(checkDue());
});
self.addEventListener('message', function (e) {
  var d = e.data || {};
  if (d.type === 'schedule' && Array.isArray(d.items)) e.waitUntil(writeJ('sched', d.items));
  else if (d.type === 'get-shown') {
    e.waitUntil(readJ('shown', []).then(function (st) {
      if (st.length && e.source) e.source.postMessage({ type: 'shown-list', items: st });
      return writeJ('shown', []);
    }));
  }
});

/* ---- avisos enviados pelo servidor (Web Push): chegam mesmo com o app fechado ---- */
self.addEventListener('push', function (e) {
  var d = {};
  try { d = e.data ? e.data.json() : {}; } catch (x) { d = {}; }
  var it = { id: d.id, title: d.title || 'Mi.Día', body: d.body || '', tag: d.tag || d.id, kind: d.kind || 'e', key: d.key };
  e.waitUntil(self.registration.showNotification(it.title, {
    body: it.body, tag: it.tag, icon: 'icons/icon-192.png', badge: 'icons/icon-192.png',
    data: { key: it.key }, actions: [{ action: 'open', title: 'Abrir' }]
  }).then(function () {
    return self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (cl) {
      if (cl.length) { cl.forEach(function (c) { c.postMessage({ type: 'shown-list', items: [it] }); }); return; }
      return readJ('shown', []).then(function (st) { return writeJ('shown', st.concat([it]).slice(-50)); });
    });
  }));
});
self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  var key = (e.notification.data && e.notification.data.key) || '';
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (cl) {
    if (cl.length) { cl[0].postMessage({ type: 'notif-click', key: key }); return cl[0].focus ? cl[0].focus() : null; }
    return self.clients.openWindow('./' + (key ? '#dia=' + key : ''));
  }));
});
