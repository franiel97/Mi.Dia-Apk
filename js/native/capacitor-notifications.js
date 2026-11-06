/* Mi.Día Android bridge — Capacitor Local Notifications.
 * The web app remains hosted on Netlify; this adapter adds device-local alarms.
 */
(function () {
  'use strict';
  var cap = window.Capacitor;
  var native = !!(cap && typeof cap.isNativePlatform === 'function' && cap.isNativePlatform());
  var plugin = native && cap.Plugins && cap.Plugins.LocalNotifications;
  window.MidiaNativeNotifications = {
    isNative: native,
    isAvailable: !!plugin,
    granted: false,
    exact: false,
    async checkPermission() {
      if (!plugin) return false;
      try {
        var p = await plugin.checkPermissions();
        this.granted = p.display === 'granted';
      } catch (_) { this.granted = false; }
      return this.granted;
    },
    async requestPermission() {
      if (!plugin) return false;
      try {
        var p = await plugin.requestPermissions();
        this.granted = p.display === 'granted';
      } catch (_) { this.granted = false; }
      return this.granted;
    },
    async checkExact() {
      if (!plugin || typeof plugin.checkExactNotificationSetting !== 'function') { this.exact = true; return true; }
      try {
        var r = await plugin.checkExactNotificationSetting();
        this.exact = r.exact_alarm === 'granted';
      } catch (_) { this.exact = false; }
      return this.exact;
    },
    /* Abre a tela do Android "Alarmes e lembretes" para o usuário liberar o horário exato. */
    async requestExact() {
      if (!plugin || typeof plugin.changeExactNotificationSetting !== 'function') return true;
      try {
        var r = await plugin.changeExactNotificationSetting();
        this.exact = r.exact_alarm === 'granted';
      } catch (_) { this.exact = false; }
      return this.exact;
    },
    async cancelAll() {
      if (!plugin) return;
      try {
        var pending = await plugin.getPending();
        var list = (pending.notifications || []).map(function (n) { return { id: n.id }; });
        if (list.length) await plugin.cancel({ notifications: list });
      } catch (e) { console.warn('[Mi.Día] Não foi possível cancelar alarmes nativos', e); }
    },
    async sync(items) {
      if (!plugin || !this.granted) return;
      var now = Date.now();
      var valid = (items || []).filter(function (it) { return it && it.at > now && it.until > now; });
      await this.cancelAll();
      if (!valid.length) return;
      var notifications = valid.map(function (it) {
        var id = 0;
        var s = String(it.id || '');
        for (var i = 0; i < s.length; i++) id = ((id * 31) + s.charCodeAt(i)) | 0;
        id = Math.abs(id) || 1;
        return {
          id: id,
          title: it.title || 'Mi.Día',
          body: it.body || '',
          schedule: { at: new Date(Math.max(it.at, now + 1500)), allowWhileIdle: true },
          channelId: 'midia-tasks',
          smallIcon: 'ic_stat_midia',
          iconColor: '#6D5DFB',
          sound: 'default',
          extra: { key: it.key || null, kind: it.kind || null, sourceId: it.id || null }
        };
      });
      try { await plugin.schedule({ notifications: notifications }); }
      catch (e) { console.error('[Mi.Día] Falha ao agendar notificações nativas', e); }
    },
    async notifyNow(title, body, key) {
      if (!plugin || !this.granted) return;
      var id = Math.floor(Date.now() % 2000000000) || 1;
      try {
        await plugin.schedule({ notifications: [{
          id: id, title: title, body: body,
          schedule: { at: new Date(Date.now() + 1200) },
          channelId: 'midia-tasks', smallIcon: 'ic_stat_midia',
          iconColor: '#6D5DFB', sound: 'default', extra: { key: key || null }
        }] });
      } catch (e) { console.error('[Mi.Día] Falha ao exibir notificação', e); }
    }
  };
  var appPlugin = native && cap.Plugins && cap.Plugins.App;
  if (plugin) {
    window.MidiaNativeNotifications.checkExact();
    if (appPlugin && appPlugin.addListener) {
      /* Ao voltar das configurações do Android, relê as permissões e reagenda com o horário exato. */
      appPlugin.addListener('appStateChange', function (st) {
        if (!st || !st.isActive) return;
        var n = window.MidiaNativeNotifications, before = n.exact;
        Promise.all([n.checkPermission(), n.checkExact()]).then(function () {
          if (n.exact !== before && typeof window.syncSchedule === 'function') { window.lastSched = ''; window.syncSchedule(); }
          if (typeof window.syncNotifUI === 'function') window.syncNotifUI();
        });
      });
    }
    window.MidiaNativeNotifications.checkPermission().then(function () {
      if (typeof window.syncNotifUI === 'function') window.syncNotifUI();
    });
    plugin.addListener('localNotificationActionPerformed', function (event) {
      var key = event && event.notification && event.notification.extra && event.notification.extra.key;
      if (typeof window.openDayFromNotif === 'function') window.openDayFromNotif(key);
      else window.__midiaPendingNotifKey = key || null;
    });
  }
})();
