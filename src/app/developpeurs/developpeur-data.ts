export interface ApiParam {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

export interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'WebSocket';
  path: string;
  description: string;
  params?: ApiParam[];
  requestBody?: Record<string, unknown>;
  responseExample: Record<string, unknown>;
  errorCodes: { code: number; message: string }[];
}

export interface ApiCategory {
  id: string;
  label: string;
  description: string;
  endpoints: ApiEndpoint[];
}

export const apiCategories: ApiCategory[] = [
  {
    id: 'auth',
    label: 'Authentification',
    description: 'Gestion des sessions, tokens JWT et inscription des utilisateurs.',
    endpoints: [
      {
        method: 'POST',
        path: '/auth/login',
        description: 'Authentifie un utilisateur avec email et mot de passe. Retourne un token JWT et un refresh token.',
        params: [
          { name: 'email', type: 'string', required: true, description: 'Adresse email de l\'utilisateur' },
          { name: 'password', type: 'string', required: true, description: 'Mot de passe' },
        ],
        requestBody: {
          email: 'user@example.com',
          password: 'votreMotDePasse',
        },
        responseExample: {
          status: 200,
          data: {
            accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            refreshToken: 'def502...',
            expiresIn: 3600,
            user: {
              id: 'usr_123',
              email: 'user@example.com',
              nom: 'Nkoudou',
              prenom: 'Jean',
            },
          },
        },
        errorCodes: [
          { code: 400, message: 'Requête invalide - champs manquants' },
          { code: 401, message: 'Identifiants incorrects' },
          { code: 429, message: 'Trop de tentatives de connexion' },
        ],
      },
      {
        method: 'POST',
        path: '/auth/register',
        description: 'Crée un nouveau compte utilisateur et retourne les tokens d\'accès.',
        params: [
          { name: 'email', type: 'string', required: true, description: 'Adresse email unique' },
          { name: 'password', type: 'string', required: true, description: 'Mot de passe (min. 8 caractères)' },
          { name: 'nom', type: 'string', required: true, description: 'Nom de famille' },
          { name: 'prenom', type: 'string', required: true, description: 'Prénom' },
          { name: 'telephone', type: 'string', required: true, description: 'Numéro de téléphone avec indicatif' },
        ],
        requestBody: {
          email: 'jean.nkoudou@example.com',
          password: 'SecurePass123!',
          nom: 'Nkoudou',
          prenom: 'Jean',
          telephone: '+237699112233',
        },
        responseExample: {
          status: 201,
          data: {
            accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            refreshToken: 'def502...',
            user: {
              id: 'usr_456',
              email: 'jean.nkoudou@example.com',
              nom: 'Nkoudou',
              prenom: 'Jean',
            },
          },
        },
        errorCodes: [
          { code: 400, message: 'Données invalides ou email déjà utilisé' },
          { code: 422, message: 'Mot de passe trop faible' },
        ],
      },
      {
        method: 'POST',
        path: '/auth/refresh',
        description: 'Renouvelle le token d\'accès à l\'aide du refresh token.',
        params: [
          { name: 'refreshToken', type: 'string', required: true, description: 'Le refresh token actuel' },
        ],
        requestBody: {
          refreshToken: 'def502004c...',
        },
        responseExample: {
          status: 200,
          data: {
            accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            expiresIn: 3600,
          },
        },
        errorCodes: [
          { code: 401, message: 'Refresh token invalide ou expiré' },
          { code: 400, message: 'Refresh token manquant' },
        ],
      },
    ],
  },
  {
    id: 'tontines',
    label: 'Tontines',
    description: 'Création, gestion et suivi des tontines et de leurs membres.',
    endpoints: [
      {
        method: 'GET',
        path: '/tontines',
        description: 'Liste toutes les tontines auxquelles l\'utilisateur authentifié appartient.',
        responseExample: {
          status: 200,
          data: [
            {
              id: 'ton_abc',
              nom: 'Famille Nkoudou',
              type: 'rosca',
              montantCotisation: 50000,
              frequence: 'mensuelle',
              membresCount: 12,
              statut: 'active',
            },
          ],
        },
        errorCodes: [
          { code: 401, message: 'Token manquant ou invalide' },
        ],
      },
      {
        method: 'POST',
        path: '/tontines',
        description: 'Crée une nouvelle tontine. L\'utilisateur devient automatiquement président.',
        params: [
          { name: 'nom', type: 'string', required: true, description: 'Nom de la tontine' },
          { name: 'type', type: 'string', required: true, description: 'rosca | asca | hybride | nature | services | solidarite | culturelle' },
          { name: 'montantCotisation', type: 'number', required: true, description: 'Montant de chaque cotisation en FCFA' },
          { name: 'frequence', type: 'string', required: true, description: 'hebdomadaire | mensuelle | trimestrielle | annuelle' },
          { name: 'nbMembres', type: 'number', required: true, description: 'Nombre de membres prévu' },
        ],
        requestBody: {
          nom: 'ASCA Mamans Douala',
          type: 'asca',
          montantCotisation: 25000,
          frequence: 'mensuelle',
          nbMembres: 15,
        },
        responseExample: {
          status: 201,
          data: {
            id: 'ton_xyz',
            nom: 'ASCA Mamans Douala',
            type: 'asca',
            montantCotisation: 25000,
            frequence: 'mensuelle',
            statut: 'active',
            createdAt: '2024-06-01T10:00:00Z',
          },
        },
        errorCodes: [
          { code: 400, message: 'Paramètres invalides' },
          { code: 403, message: 'Limite de tontines atteinte' },
        ],
      },
      {
        method: 'GET',
        path: '/tontines/:id',
        description: 'Retourne les détails complets d\'une tontine incluant membres et sessions.',
        params: [
          { name: 'id', type: 'string', required: true, description: 'ID unique de la tontine' },
        ],
        responseExample: {
          status: 200,
          data: {
            id: 'ton_abc',
            nom: 'Famille Nkoudou',
            type: 'rosca',
            montantCotisation: 50000,
            frequence: 'mensuelle',
            statut: 'active',
            membres: [
              { id: 'mem_1', nom: 'Jean N.', role: 'president' },
            ],
          },
        },
        errorCodes: [
          { code: 404, message: 'Tontine introuvable' },
          { code: 403, message: 'Accès non autorisé à cette tontine' },
        ],
      },
      {
        method: 'PUT',
        path: '/tontines/:id',
        description: 'Met à jour les informations d\'une tontine existante.',
        params: [
          { name: 'id', type: 'string', required: true, description: 'ID de la tontine' },
          { name: 'nom', type: 'string', required: false, description: 'Nouveau nom' },
          { name: 'montantCotisation', type: 'number', required: false, description: 'Nouveau montant' },
        ],
        requestBody: {
          nom: 'Famille Nkoudou Édition 2024',
          montantCotisation: 75000,
        },
        responseExample: {
          status: 200,
          data: {
            id: 'ton_abc',
            nom: 'Famille Nkoudou Édition 2024',
            montantCotisation: 75000,
            updatedAt: '2024-06-15T08:30:00Z',
          },
        },
        errorCodes: [
          { code: 404, message: 'Tontine introuvable' },
          { code: 403, message: 'Seul le président peut modifier la tontine' },
        ],
      },
      {
        method: 'DELETE',
        path: '/tontines/:id',
        description: 'Supprime une tontine. Nécessite le rôle de président et aucun membre actif.',
        params: [
          { name: 'id', type: 'string', required: true, description: 'ID de la tontine' },
        ],
        responseExample: {
          status: 200,
          data: {
            message: 'Tontine supprimée avec succès',
            id: 'ton_abc',
          },
        },
        errorCodes: [
          { code: 403, message: 'Action non autorisée' },
          { code: 400, message: 'Impossible de supprimer une tontine avec des membres actifs' },
        ],
      },
      {
        method: 'POST',
        path: '/tontines/:id/members',
        description: 'Ajoute un membre à une tontine existante.',
        params: [
          { name: 'id', type: 'string', required: true, description: 'ID de la tontine' },
          { name: 'userId', type: 'string', required: true, description: 'ID de l\'utilisateur à ajouter' },
          { name: 'role', type: 'string', required: false, description: 'membre | tresorier | secretaire | conseiller (défaut: membre)' },
        ],
        requestBody: {
          userId: 'usr_789',
          role: 'membre',
        },
        responseExample: {
          status: 201,
          data: {
            id: 'mem_5',
            userId: 'usr_789',
            tontineId: 'ton_abc',
            role: 'membre',
            dateAdhesion: '2024-06-10T14:20:00Z',
          },
        },
        errorCodes: [
          { code: 404, message: 'Tontine ou utilisateur introuvable' },
          { code: 409, message: 'L\'utilisateur est déjà membre' },
        ],
      },
    ],
  },
  {
    id: 'cotisations',
    label: 'Cotisations',
    description: 'Gestion des paiements, suivi des cotisations et reçus.',
    endpoints: [
      {
        method: 'GET',
        path: '/cotisations',
        description: 'Liste les cotisations de l\'utilisateur ou d\'une tontine spécifique.',
        params: [
          { name: 'tontineId', type: 'string', required: false, description: 'Filtrer par tontine' },
          { name: 'statut', type: 'string', required: false, description: 'paye | en_attente | en_retard' },
        ],
        responseExample: {
          status: 200,
          data: [
            {
              id: 'cot_1',
              sessionId: 'ses_1',
              montant: 50000,
              statut: 'paye',
              datePaiement: '2024-01-05T09:15:00Z',
              moyenPaiement: 'mobile_money',
            },
          ],
        },
        errorCodes: [
          { code: 401, message: 'Authentification requise' },
        ],
      },
      {
        method: 'POST',
        path: '/cotisations',
        description: 'Enregistre un paiement de cotisation pour une session donnée.',
        params: [
          { name: 'sessionId', type: 'string', required: true, description: 'ID de la session' },
          { name: 'montant', type: 'number', required: true, description: 'Montant versé' },
          { name: 'moyenPaiement', type: 'string', required: true, description: 'mobile_money | carte | virement | especes' },
        ],
        requestBody: {
          sessionId: 'ses_5',
          montant: 50000,
          moyenPaiement: 'mobile_money',
        },
        responseExample: {
          status: 201,
          data: {
            id: 'cot_12',
            sessionId: 'ses_5',
            montant: 50000,
            statut: 'paye',
            datePaiement: '2024-07-02T11:30:00Z',
            recuUrl: 'https://api.tchoua.app/v1/receipts/cot_12.pdf',
          },
        },
        errorCodes: [
          { code: 400, message: 'Montant incorrect ou session invalide' },
          { code: 402, message: 'Paiement rejeté par le processeur' },
        ],
      },
    ],
  },
  {
    id: 'webhooks',
    label: 'Webhooks',
    description: 'Notifications push vers vos systèmes externes lors d\'événements clés.',
    endpoints: [
      {
        method: 'POST',
        path: '/webhooks/cotisation',
        description: 'Souscrit ou configure le webhook pour les événements de cotisation.',
        params: [
          { name: 'url', type: 'string', required: true, description: 'URL de callback HTTPS' },
          { name: 'events', type: 'string[]', required: true, description: 'Types d\'événements: cotisation.paye | cotisation.retard | cotisation.reminder' },
          { name: 'secret', type: 'string', required: true, description: 'Secret pour signature HMAC' },
        ],
        requestBody: {
          url: 'https://votre-app.com/webhooks/cotisation',
          events: ['cotisation.paye', 'cotisation.retard'],
          secret: 'whsec_votreSecretSuperSecure',
        },
        responseExample: {
          status: 201,
          data: {
            id: 'wh_1',
            url: 'https://votre-app.com/webhooks/cotisation',
            events: ['cotisation.paye', 'cotisation.retard'],
            active: true,
            createdAt: '2024-06-01T00:00:00Z',
          },
        },
        errorCodes: [
          { code: 400, message: 'URL invalide ou events non supportés' },
        ],
      },
    ],
  },
];

export const changelog = [
  { version: 'v1.3.0', date: '2024-08-15', description: 'Ajout des fréquences avancées (bi-mensuelle, hebdomadaire personnalisée) et amélioration des webhooks.' },
  { version: 'v1.2.0', date: '2024-07-01', description: 'Lancement de la marketplace avec API produits, commandes et livraison.' },
  { version: 'v1.1.0', date: '2024-05-20', description: 'Ajout de l\'API Chat avec WebSocket temps réel et historique des messages.' },
  { version: 'v1.0.0', date: '2024-03-01', description: 'Release initiale avec authentification, tontines, cotisations et prêts.' },
];

export const sdkExamples = {
  javascript: `import { TchouaAPI } from '@tchoua/sdk';

const api = new TchouaAPI({
  apiKey: 'your-api-key',
  environment: 'sandbox' // or 'production'
});

// List tontines
const tontines = await api.tontines.list();
console.log(tontines);

// Create a cotisation
const cotisation = await api.cotisations.create({
  sessionId: 'ses_5',
  montant: 50000,
  moyenPaiement: 'mobile_money'
});`,
  typescript: `import { TchouaAPI, Tontine, CotisationInput } from '@tchoua/sdk';

const api = new TchouaAPI({
  apiKey: process.env.TCHOUA_API_KEY!,
  environment: 'production',
});

async function main(): Promise<void> {
  const tontines: Tontine[] = await api.tontines.list();
  const input: CotisationInput = {
    sessionId: 'ses_5',
    montant: 50000,
    moyenPaiement: 'mobile_money',
  };
  const cotisation = await api.cotisations.create(input);
  console.log(cotisation.recuUrl);
}

main();`,
  python: `from tchoua_sdk import TchouaAPI

api = TchouaAPI(
    api_key="your-api-key",
    environment="sandbox"
)

# List all tontines
tontines = api.tontines.list()
print(tontines)

# Make a payment
cotisation = api.cotisations.create(
    session_id="ses_5",
    montant=50000,
    moyen_paiement="mobile_money"
)`,
};

export const webhookEvents = [
  { event: 'cotisation.paye', description: 'Une cotisation a été payée avec succès.' },
  { event: 'cotisation.retard', description: 'Un membre est en retard de cotisation.' },
  { event: 'session.tirage', description: 'Le tirage au sort a désigné un bénéficiaire.' },
  { event: 'pret.approuve', description: 'Un prêt a été approuvé.' },
];

export const webhookPayloadExample = {
  id: 'evt_1234567890',
  type: 'cotisation.paye',
  created_at: '2024-06-20T10:30:00Z',
  data: {
    cotisation_id: 'cot_12',
    session_id: 'ses_5',
    tontine_id: 'ton_abc',
    montant: 50000,
    moyen_paiement: 'mobile_money',
  },
};

export const errorCodes = [
  { code: 400, label: 'Bad Request', description: 'La requête est mal formée ou contient des paramètres invalides.' },
  { code: 401, label: 'Unauthorized', description: 'Le token d\'authentification est manquant ou invalide.' },
  { code: 403, label: 'Forbidden', description: 'L\'utilisateur n\'a pas les permissions nécessaires.' },
  { code: 404, label: 'Not Found', description: 'La ressource demandée n\'existe pas.' },
  { code: 429, label: 'Too Many Requests', description: 'Limite de requêtes dépassée.' },
  { code: 500, label: 'Internal Server Error', description: 'Erreur interne du serveur.' },
];

export const authHeaders = [
  { name: 'Authorization', value: 'Bearer <token>', description: 'Token JWT d\'accès obtenu après login' },
  { name: 'X-API-Key', value: '<api-key>', description: 'Clé API propre à votre application' },
  { name: 'Content-Type', value: 'application/json', description: 'Requis pour toutes les requêtes POST/PUT' },
];
