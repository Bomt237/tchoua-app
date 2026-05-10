export interface ApiEndpoint {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  description: {
    fr: string;
    en: string;
  };
  params?: {
    name: string;
    type: string;
    description: {
      fr: string;
      en: string;
    };
  }[];
}

export const DEVELOPER_DATA = {
  intro: {
    fr: "Bienvenue sur l'API Tchoua. Intégrez la puissance de la solidarité digitale dans vos propres applications.",
    en: "Welcome to Tchoua API. Integrate the power of digital solidarity into your own applications."
  },
  endpoints: [
    {
      method: "GET",
      path: "/api/v1/tontines",
      description: {
        fr: "Récupère la liste des tontines auxquelles l'utilisateur participe.",
        en: "Retrieve the list of tontines the user participates in."
      }
    },
    {
      method: "POST",
      path: "/api/v1/cotisations",
      description: {
        fr: "Enregistre une nouvelle cotisation (Cash, Nature ou Service).",
        en: "Record a new contribution (Cash, Nature or Service)."
      },
      params: [
        { name: "tontineId", type: "UUID", description: { fr: "ID de la tontine", en: "Tontine ID" } },
        { name: "amount", type: "Decimal", description: { fr: "Montant (si cash)", en: "Amount (if cash)" } },
        { name: "type", type: "Enum", description: { fr: "CASH | NATURE | SERVICE", en: "CASH | NATURE | SERVICE" } }
      ]
    },
    {
      method: "GET",
      path: "/api/v1/marketplace/products",
      description: {
        fr: "Liste les produits disponibles sur le marketplace.",
        en: "List available products on the marketplace."
      }
    }
  ] as ApiEndpoint[]
};
