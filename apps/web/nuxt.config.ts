// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-05-01",
  future: { compatibilityVersion: 4 },
  devtools: { enabled: true },

  css: ["~/assets/css/main.css"],
  modules: [
    "@nuxtjs/supabase",
    "@pinia/nuxt",
    "@nuxtjs/tailwindcss",
    "@nuxt/eslint",
    "shadcn-nuxt",
    "@vueuse/nuxt",
    "@nuxtjs/i18n",
  ],

  i18n: {
    locales: [
      { code: "en", language: "en-US", name: "English", dir: "ltr", file: "en.json" },
      { code: "ar", language: "ar", name: "العربية", dir: "rtl", file: "ar.json" },
    ],
    defaultLocale: "en",
    strategy: "no_prefix",
    restructureDir: "",
    langDir: "app/i18n/locales",
    vueI18n: "app/i18n/i18n.config.ts",
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "amanah_locale",
      redirectOn: "root",
      fallbackLocale: "en",
    },
  },
  shadcn: {
    prefix: "",
    componentDir: "./app/components/ui",
  },

  components: [
    { path: "~/components/ui", pathPrefix: false },
    { path: "~/components/beneficiary", pathPrefix: false },
    { path: "~/components/distribution", pathPrefix: false },
    { path: "~/components/shared", pathPrefix: false },
  ],

  supabase: {
    redirectOptions: {
      login: "/login",
      callback: "/confirm",
      exclude: ["/", "/signup", "/forgot-password", "/reset-password", "/confirm", "/invite/accept", "/public/*"],
      // Remember the page a signed-out user tried to open; login sends them back there.
      saveRedirectToCookie: true,
    },
  },

  runtimeConfig: {
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_KEY,
    },
  },

  typescript: {
    tsConfig: {
      compilerOptions: {
        types: ["node"],
      },
    },
    strict: true,
    shim: false,
  },

  app: {
    head: {
      title: "Amanah — Beneficiary & Aid Management",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        // Colors the mobile browser chrome with the primary (brand-600).
        { name: "theme-color", content: "#075e46" },
        {
          name: "description",
          content:
            "Amanah helps charities and aid organizations manage beneficiaries, track recurring needs, and record distributions with full transparency.",
        },
      ],
      link: [
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
        {
          // Inter draws Latin and digits, Noto Sans Arabic draws Arabic (see fontFamily.sans in tailwind.config.ts).
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap",
        },
      ],
    },
  },
});
