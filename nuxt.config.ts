// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL,
  }, //настройка конфигурации для работы с переменными окружения
});
