export type Locale = "en" | "es";

export const defaultLocale: Locale = "en";

export function getLocale(searchParams?: Record<string, any>): Locale {
  const lang = searchParams?.lang;
  if (lang === "es") return "es";
  return "en";
}

export const messages = {
  en: {
    common: {
      home: "Home",
      pricing: "Pricing",
      login: "Login",
      register: "Register",
      startFree: "Start free"
    },

    home: {
      title: "Track your collection.",
      subtitle: "Understand its value. Watch it evolve.",
      cta: "Create account"
    },

    pricing: {
      title: "Pricing",
      subtitle: "Start free. Upgrade when you need more."
    },

    login: {
      title: "Sign in to your vault",
      email: "Email",
      password: "Password",
      button: "Sign in",
      noAccount: "Don't have an account?",
      create: "Create one"
    },

    register: {
      title: "Create your account",
      email: "Email",
      password: "Password",
      confirm: "Confirm password",
      button: "Create account",
      haveAccount: "Already have an account?",
      login: "Sign in"
    }
  },

  es: {
    common: {
      home: "Inicio",
      pricing: "Precios",
      login: "Entrar",
      register: "Registro",
      startFree: "Empezar gratis"
    },

    home: {
      title: "Controla tu colección.",
      subtitle: "Entiende su valor. Observa su evolución.",
      cta: "Crear cuenta"
    },

    pricing: {
      title: "Precios",
      subtitle: "Empieza gratis. Mejora cuando necesites más."
    },

    login: {
      title: "Accede a tu colección",
      email: "Email",
      password: "Contraseña",
      button: "Entrar",
      noAccount: "¿No tienes cuenta?",
      create: "Crear una"
    },

    register: {
      title: "Crea tu cuenta",
      email: "Email",
      password: "Contraseña",
      confirm: "Confirmar contraseña",
      button: "Crear cuenta",
      haveAccount: "¿Ya tienes cuenta?",
      login: "Entrar"
    }
  }
};

export function getDictionary(locale: Locale) {
  return messages[locale] ?? messages[defaultLocale];
}