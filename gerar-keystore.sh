#!/usr/bin/env bash
# Gera a chave de assinatura (GUARDE O ARQUIVO E AS SENHAS: sem ela você não atualiza o app).
keytool -genkeypair -v -keystore midia-upload.jks -alias midia -keyalg RSA -keysize 2048 -validity 10000
echo; echo "Para o GitHub Actions: base64 -w0 midia-upload.jks  (cole em MIDIA_KEYSTORE_BASE64)"
