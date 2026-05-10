export interface Article {
  id: string;
  category: string;
  title: {
    fr: string;
    en: string;
    es: string;
    de: string;
  };
  content: {
    fr: string;
    en: string;
    es: string;
    de: string;
  };
  icon: string;
}

export const ACADEMY_ARTICLES: Article[] = [
  {
    id: "introduction",
    category: "Basics",
    icon: "👋",
    title: {
      fr: "Bienvenue sur l'Académie Tchoua",
      en: "Welcome to Tchoua Academy",
      es: "Bienvenido a la Academia Tchoua",
      de: "Willkommen in der Tchoua Akademie"
    },
    content: {
      fr: "Tchoua est bien plus qu'une application de tontine. C'est un écosystème complet pour digitaliser la solidarité traditionnelle. Cette académie vous guidera à travers toutes les fonctionnalités de la plateforme.",
      en: "Tchoua is much more than a tontine app. It is a complete ecosystem to digitalize traditional solidarity. This academy will guide you through all the features of the platform.",
      es: "Tchoua es mucho más que una aplicación de tontina. Es un ecosistema completo para digitalizar la solidaridad tradicional. Esta academia le guiará a través de todas las funciones de la plataforma.",
      de: "Tchoua ist viel mehr als eine Tontine-App. Es ist ein komplettes Ökosystem zur Digitalisierung traditioneller Solidarität. Diese Akademie wird Sie durch alle Funktionen der Plattform führen."
    }
  },
  {
    id: "tontines-rotatives",
    category: "Finance",
    icon: "🔄",
    title: {
      fr: "Comprendre les Tontines Rotatives (ROSCA)",
      en: "Understanding Rotating Tontines (ROSCA)",
      es: "Entender las tontinas rotativas (ROSCA)",
      de: "Rotierende Tontinen verstehen (ROSCA)"
    },
    content: {
      fr: "Les tontines rotatives sont le cœur historique de Tchoua. Chaque membre cotise une somme fixe à intervalles réguliers, et à chaque tour, un membre différent reçoit la totalité du pot (la main). Le cycle se termine quand tout le monde a reçu sa part.",
      en: "Rotating tontines are the historical heart of Tchoua. Each member contributes a fixed amount at regular intervals, and in each round, a different member receives the entire pot (the hand). The cycle ends when everyone has received their share.",
      es: "Las tontinas rotativas son el corazón histórico de Tchoua. Cada miembro aporta una cantidad fija a intervalos regulares, y en cada ronda, un miembro diferente recibe todo el bote (la mano). El ciclo termina cuando todos han recibido su parte.",
      de: "Rotierende Tontinen sind das historische Herz von Tchoua. Jedes Mitglied zahlt in regelmäßigen Abständen einen festen Betrag ein, und in jeder Runde erhält ein anderes Mitglied den gesamten Topf (die Hand). Der Zyklus endet, wenn jeder seinen Anteil erhalten hat."
    }
  },
  {
    id: "epargne-inca",
    category: "Finance",
    icon: "💰",
    title: {
      fr: "Épargne et Crédit Interne (ASCA)",
      en: "Internal Savings and Credit (ASCA)",
      es: "Ahorro y Crédito Interno (ASCA)",
      de: "Internes Sparen und Kredit (ASCA)"
    },
    content: {
      fr: "Le module ASCA permet à l'association de fonctionner comme une micro-banque. Les membres déposent leur épargne, et ces fonds sont utilisés pour accorder des prêts aux membres avec intérêts. Les bénéfices sont ensuite redistribués aux épargnants.",
      en: "The ASCA module allows the association to function as a micro-bank. Members deposit their savings, and these funds are used to grant loans to members with interest. Profits are then redistributed to savers.",
      es: "El módulo ASCA permite a la asociación funcionar como un microbanco. Los miembros depositan sus ahorros y esos fondos se utilizan para conceder préstamos a los miembros con intereses. A continuación, los beneficios se redistribuyen entre los ahorradores.",
      de: "Das ASCA-Modul ermöglicht es dem Verein, wie eine Mikrobank zu agieren. Die Mitglieder legen ihre Ersparnisse an, und diese Mittel werden verwendet, um den Mitgliedern Kredite mit Zinsen zu gewähren. Die Gewinne werden dann an die Sparer umverteilt."
    }
  },
  {
    id: "solidarite",
    category: "Social",
    icon: "❤️",
    title: {
      fr: "Le Fonds de Solidarité",
      en: "The Solidarity Fund",
      es: "El Fondo de Solidaridad",
      de: "Der Solidaritätsfonds"
    },
    content: {
      fr: "Ce fonds est dédié aux événements de la vie : naissances, mariages, ou deuils. L'association définit des règles d'assistance automatique. Tchoua automatise le calcul des aides et le prélèvement des cotisations exceptionnelles.",
      en: "This fund is dedicated to life events: births, weddings, or bereavements. The association defines automatic assistance rules. Tchoua automates the calculation of aid and the collection of exceptional contributions.",
      es: "Este fondo está dedicado a eventos de la vida: nacimientos, bodas o fallecimientos. La asociación define normas de asistencia automática. Tchoua automatiza el cálculo de las ayudas y el cobro de las cuotas excepcionales.",
      de: "Dieser Fonds ist Lebensereignissen gewidmet: Geburten, Hochzeiten oder Trauerfällen. Der Verein legt Regeln für die automatische Hilfe fest. Tchoua automatisiert die Berechnung der Hilfe und den Einzug außergewöhnlicher Beiträge."
    }
  },
  {
    id: "marketplace",
    category: "Economic",
    icon: "🛒",
    title: {
      fr: "Le Marketplace Communautaire",
      en: "Community Marketplace",
      es: "Mercado comunitario",
      de: "Gemeinschafts-Marktplatz"
    },
    content: {
      fr: "Le marketplace permet aux membres de vendre des produits ou services au sein du réseau. Les transactions peuvent être sécurisées par un système de séquestre utilisant les fonds de la tontine comme garantie.",
      en: "The marketplace allows members to sell products or services within the network. Transactions can be secured by an escrow system using tontine funds as a guarantee.",
      es: "El mercado permite a los miembros vender productos o servicios dentro de la red. Las transacciones pueden asegurarse mediante un sistema de depósito en garantía que utiliza los fondos de la tontina como aval.",
      de: "Der Marktplatz ermöglicht es Mitgliedern, Produkte oder Dienstleistungen innerhalb des Netzwerks zu verkaufen. Transaktionen können durch ein Treuhandsystem abgesichert werden, das Tontine-Gelder als Garantie verwendet."
    }
  },
  {
    id: "security",
    category: "Technical",
    icon: "🔒",
    title: {
      fr: "Sécurité et Transparence",
      en: "Security and Transparency",
      es: "Seguridad y transparencia",
      de: "Sicherheit und Transparenz"
    },
    content: {
      fr: "Tchoua utilise un cryptage de bout en bout et une architecture décentralisée pour garantir que vos données financières restent privées et inaltérables. Chaque transaction est enregistrée de manière transparente pour tous les membres habilités.",
      en: "Tchoua uses end-to-end encryption and a decentralized architecture to ensure your financial data remains private and unalterable. Every transaction is recorded transparently for all authorized members.",
      es: "Tchoua utiliza el cifrado de extremo a extremo y una arquitectura descentralizada para garantizar que sus datos financieros permanezcan privados e inalterables. Cada transacción se registra de forma transparente para todos los miembros autorizados.",
      de: "Tchoua verwendet eine End-zu-End-Verschlüsselung und eine dezentrale Architektur, um sicherzustellen, dass Ihre Finanzdaten privat und unveränderlich bleiben. Jede Transaktion wird für alle autorisierten Mitglieder transparent aufgezeichnet."
    }
  }
];
