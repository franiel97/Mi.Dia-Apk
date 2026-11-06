# Mi.Día Android — Capacitor + Netlify

Este pacote prepara a versão Android híbrida do Mi.Día v0.30.0.

## Estratégia de atualização

O `capacitor.config.json` aponta o WebView para `https://midia-planner.netlify.app/`. Portanto, alterações publicadas nesse site (HTML/CSS/JS) são carregadas pelo app sem reinstalar o APK. Alterações no código Kotlin, permissões Android, plugins ou recursos nativos exigem uma nova compilação e distribuição do APK.

**Importante:** `server.url` é uma opção de carregamento remoto do Capacitor. É adequada ao requisito de atualização imediata do conteúdo, mas depende de conexão para a primeira carga e exige manter o domínio HTTPS sob controle. O `www/index.html` é somente uma tela de contingência; não é uma cópia offline integral do site.

## Recursos nativos preparados

- Capacitor 7 e Android.
- Plugin Local Notifications para agendamento local Android, inclusive com o app fechado.
- Adaptador `js/native/capacitor-notifications.js` que envia a agenda de tarefas para o plugin.
- Abertura do dia correspondente ao tocar em uma notificação.
- Ícone, canal e cor de notificação configuráveis.

As notificações dependem da permissão do Android 13+ e das políticas de economia de bateria do fabricante. Para horários exatos em todos os aparelhos, é necessário revisar o acesso a alarmes exatos e a política de distribuição do aplicativo. A primeira execução em dispositivo real é obrigatória para validar os alarmes e os cliques nas notificações.

## Como gerar o projeto Android

Requisitos: Node.js 20+, JDK 17+, Android Studio e Android SDK (API 23+).

```bash
npm install
npx cap add android
npx cap sync android
npx cap open android
```

No Android Studio, aguarde a sincronização Gradle e gere o APK em **Build > Build Bundle(s) / APK(s) > Build APK(s)**. Para compilar por linha de comando:

```bash
npm run build:android
```

## Publicação do site

1. Aplique as alterações deste pacote ao repositório que publica o Netlify.
2. Faça deploy do site normalmente.
3. O aplicativo Android carregará a versão publicada ao abrir/recarregar.
4. Para uma nova função que use outro plugin nativo, adicione o plugin, sincronize e distribua um novo APK.

## Verificações antes de distribuir

- Confirmar que o domínio de homologação é o domínio definitivo desejado.
- Validar login/Supabase no WebView Android.
- Testar agendamento, cancelamento, reinicialização do aparelho e clique na notificação.
- Testar navegação voltar, teclado, upload/download de backup e compartilhamento.
- Configurar ícone monocromático Android (`ic_stat_midia`) e splash screen finais.
- Avaliar uma política de atualização/rollback do site para evitar incompatibilidade entre JS remoto e plugin nativo antigo.

## Limitações conhecidas deste pacote

Este é o projeto-fonte de integração, não um APK já assinado. O ambiente de execução usado para preparar o pacote não possui Android SDK/Gradle instalados; por isso, a compilação final e os testes em aparelho precisam ser feitos em um ambiente Android Studio. Também não foi possível validar permissões OEM/alarme exato sem aparelho físico.
