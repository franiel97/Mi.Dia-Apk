# Mi.Día Android

O app carrega https://midia-planner.netlify.app (Capacitor `server.url`).
Veja `PLAY-STORE-CHECKLIST.md` para publicar.

## Build sem instalar nada (GitHub Actions)
Envie esta pasta ao GitHub → Actions → **Build Android** → Run workflow.
Sem secrets: gera `app-debug.apk` (teste). Com secrets de assinatura: também `app-release.aab` e `app-release.apk`.

## Build local
Requisitos: Node 22+, JDK 17+, Android Studio/SDK 36.
```
npm install && npx cap sync android
cd android && ./gradlew assembleDebug      # teste
./gradlew bundleRelease                      # Play Store (precisa de keystore.properties)
```
