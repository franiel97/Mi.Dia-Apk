# Checklist de publicação — Google Play

## Já feito no projeto
- Capacitor 8, `targetSdk 36` / `compileSdk 36` / `minSdk 24` (exigência da Play desde 31/08/2026)
- Build AAB assinado (`bundleRelease`) com keystore por variáveis/`keystore.properties`
- `versionCode` incremental (variável `MIDIA_VERSION_CODE`), `versionName 0.30.0`
- Permissões: INTERNET, POST_NOTIFICATIONS, RECEIVE_BOOT_COMPLETED, SCHEDULE_EXACT_ALARM
- Fluxo de alarme exato: o app abre "Alarmes e lembretes" ao ativar notificações; se negado, avisa que pode atrasar

## Você precisa fazer
1. `./gerar-keystore.sh` e guardar o `.jks` + senhas em local seguro (backup!).
2. No GitHub: Settings → Secrets → `MIDIA_KEYSTORE_BASE64`, `MIDIA_KEYSTORE_PASSWORD`, `MIDIA_KEY_ALIAS`, `MIDIA_KEY_PASSWORD`.
3. Actions → Build Android → Run workflow (informe o versionCode; aumente a cada envio). Baixe o `app-release.aab`.
4. Play Console (conta de desenvolvedor, taxa única de US$ 25):
   - Criar app → enviar o `.aab` em Teste interno → depois Produção.
   - **Play App Signing**: aceitar (a chave que você gerou vira "chave de upload").
   - Política de privacidade: publicar `POLITICA-DE-PRIVACIDADE-modelo.md` (preenchida) em uma URL pública e informar.
   - Segurança dos dados: declarar e-mail/conta (se usar nuvem) e dados de app (tarefas).
   - **Declaração de permissão de alarmes exatos** (Conteúdo do app): justificar "lembretes de tarefas em horário marcado pelo usuário (função principal do planner)".
   - Classificação de conteúdo, público-alvo, categoria (Produtividade), ícone 512×512 (`icons/icon-512.png`), imagem de recursos 1024×500 e ao menos 2 capturas de tela.
   - Contas pessoais novas: teste fechado com 12 testadores por 14 dias antes de liberar produção.
5. Antes de publicar o site: fazer deploy da v0.30.0 no Netlify (o site atual é v.ea-0.11.1 e não tem a ponte nativa).

## Riscos de revisão
- App que só abre um site pode ser recusado como "mínimo de funcionalidade". Aqui há alarmes nativos, tela cheia e notificações, o que ajuda; descreva isso na ficha.
- Se a Play negar SCHEDULE_EXACT_ALARM, remova a permissão do manifest: os avisos continuam, só sem horário exato.
