/* i18n.js - tradução da interface do Mi.Día (arquivo separado do HTML).
 *
 * Como funciona
 *  - O texto em português (já com "tarefa") é a chave; o valor é o texto traduzido.
 *  - {0}, {1}... são os valores inseridos pelo app (nomes, números, horários).
 *  - Chaves com prefixo "dm|" e "my|" são só formatos de data (dia/mês e mês/ano).
 *  - Somente textos da interface são traduzidos: títulos e descrições das tarefas nunca passam por aqui.
 *
 * Para adicionar um idioma: inclua o código e o nome em "langs" e crie um bloco igual ao de "en" em "dict".
 * Texto sem tradução cai automaticamente no português.
 */
'use strict';
window.I18N = {
  langs: {"pt-BR": "Português", "en": "English", "es": "Español"},
  dict: {}
};
