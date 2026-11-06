# Ajustes nativos recomendados após `npx cap add android`

1. Em `android/app/src/main/AndroidManifest.xml`, confirme as permissões geradas pelo plugin Local Notifications. Android 13+ exige `POST_NOTIFICATIONS`. Caso se opte por alarme exato, avaliar `SCHEDULE_EXACT_ALARM` e o fluxo de autorização correspondente, respeitando as políticas da Play Store.
2. Configurar `MainActivity` para imersão de tela cheia (ocultar status bar e navigation bar com `WindowInsetsController` e `BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE`).
3. Manter a navegação permitida limitada a `midia-planner.netlify.app` e HTTPS.
4. Definir ícone de notificação monocromático em `res/drawable/ic_stat_midia.xml` e ícones adaptativos do launcher.
5. Configurar a tela de abertura e testar retorno do Android.

Não habilitar tráfego HTTP sem TLS e não liberar domínios genéricos em `allowNavigation`.
