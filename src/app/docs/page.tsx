"use client";

import { useState } from "react";
import { AdaptiveLayout } from "@/components/layout/adaptive-layout";
import { Code, Copy, Check, Terminal, Globe } from "lucide-react";

const endpoints = [
  {
    group: "Authentification",
    color: "#059669",
    routes: [
      {
        method: "POST", path: "/api/auth/signin",
        desc: "Connexion utilisateur — retourne un token JWT",
        body: `{ "email": "demo@tchoua.cm", "password": "demo123" }`,
        response: `{ "token": "eyJhbGci...", "user": { "id": "...", "name": "Marie Ngono" } }`,
        example: `curl -X POST https://votre-domaine.com/api/auth/signin \\
  -H "Content-Type: application/json" \\
  -d '{"email":"demo@tchoua.cm","password":"demo123"}'`,
      },
      {
        method: "GET", path: "/api/dashboard",
        desc: "Tableau de bord — KPIs et données récentes de l'utilisateur connecté",
        auth: true,
        response: `{ "user": {...}, "tontinesCount": 3, "totalContributed": 75000, "notifications": [...] }`,
        example: `curl https://votre-domaine.com/api/dashboard \\
  -H "Authorization: Bearer {token}"`,
      },
    ],
  },
  {
    group: "Tontines",
    color: "#0d3d28",
    routes: [
      {
        method: "GET", path: "/api/tontines",
        desc: "Liste les tontines (avec ?mine=true pour les tontines de l'utilisateur)",
        auth: true,
        response: `{ "tontines": [{ "id": "...", "name": "...", "type": "ROSCA", "caisseBalance": 0 }] }`,
        example: `curl "https://votre-domaine.com/api/tontines?mine=true" \\
  -H "Authorization: Bearer {token}"`,
      },
      {
        method: "POST", path: "/api/tontines",
        desc: "Créer une nouvelle tontine",
        auth: true,
        body: `{
  "name": "Tontine des Femmes",
  "type": "ROSCA",
  "contributionAmount": 25000,
  "frequencyConfig": {"type":"MONTHLY_NTH_WEEKDAY","dayOfWeek":6,"nth":1},
  "partAmount": 25000,
  "allocationMethod": "FIXED",
  "maxPartsPerSession": 1,
  "caisseLoanRate": 5,
  "bureauConfig": {
    "president": {"name":"Marie Ngono","email":"marie@tchoua.cm"},
    "tresorier": {"name":"Jean Nkomo","email":"jean@tchoua.cm"}
  }
}`,
        response: `{ "id": "cuid...", "name": "Tontine des Femmes", "status": "ACTIVE" }`,
        example: `curl -X POST https://votre-domaine.com/api/tontines \\
  -H "Authorization: Bearer {token}" \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Tontine des Femmes","type":"ROSCA","contributionAmount":25000}'`,
      },
      {
        method: "GET", path: "/api/tontines/{id}/accounts",
        desc: "Lister les comptes bancaires / Mobile Money d'une tontine",
        auth: true,
        response: `[{ "id": "...", "label": "MTN MoMo", "type": "MOBILE_MONEY", "mobileNumber": "+237677..." }]`,
        example: `curl https://votre-domaine.com/api/tontines/{id}/accounts \\
  -H "Authorization: Bearer {token}"`,
      },
      {
        method: "POST", path: "/api/tontines/{id}/accounts",
        desc: "Ajouter un compte (Président ou Trésorier uniquement)",
        auth: true,
        body: `{
  "label": "Compte principal UBA",
  "type": "BANK",
  "bankName": "UBA Cameroun",
  "accountNumber": "10234567890",
  "accountHolder": "Tontine des Femmes",
  "isDefault": true
}`,
        response: `{ "id": "...", "label": "Compte principal UBA", "isDefault": true }`,
        example: `curl -X POST https://votre-domaine.com/api/tontines/{id}/accounts \\
  -H "Authorization: Bearer {token}" \\
  -d '{"label":"MTN MoMo","type":"MOBILE_MONEY","mobileNumber":"+237677001122"}'`,
      },
      {
        method: "GET", path: "/api/tontines/{id}/caisse",
        desc: "Solde et historique de la caisse (reliquat)",
        auth: true,
        response: `{ "caisseBalance": 45000, "caisseLoanRate": 5, "entries": [...], "loans": [...] }`,
        example: `curl https://votre-domaine.com/api/tontines/{id}/caisse \\
  -H "Authorization: Bearer {token}"`,
      },
      {
        method: "POST", path: "/api/tontines/{id}/caisse-loans",
        desc: "Prêter de l'argent depuis la caisse à un membre",
        auth: true,
        body: `{ "borrowerId": "user-id", "amount": 20000, "interestRate": 5, "duration": 1 }`,
        response: `{ "id": "...", "amount": 20000, "totalDue": 21000, "status": "ACTIVE" }`,
        example: `curl -X POST https://votre-domaine.com/api/tontines/{id}/caisse-loans \\
  -H "Authorization: Bearer {token}" \\
  -d '{"borrowerId":"uid","amount":20000,"interestRate":5,"duration":1}'`,
      },
      {
        method: "GET", path: "/api/tontines/{id}/documents",
        desc: "Lister les documents (PDF règlement, statuts...)",
        auth: true,
        response: `[{ "id":"...", "name":"Règlement", "type":"REGLEMENT", "url":"/uploads/...", "mimeType":"application/pdf" }]`,
        example: `curl https://votre-domaine.com/api/tontines/{id}/documents \\
  -H "Authorization: Bearer {token}"`,
      },
    ],
  },
  {
    group: "Cotisations",
    color: "#e68a00",
    routes: [
      {
        method: "GET", path: "/api/contributions",
        desc: "Liste les cotisations (filtres: tontineId, userId, status, month)",
        auth: true,
        response: `{ "contributions": [{ "id":"...", "amount":25000, "status":"PAID", "paymentMethod":"MTN_MOMO" }] }`,
        example: `curl "https://votre-domaine.com/api/contributions?tontineId=xxx&status=PENDING" \\
  -H "Authorization: Bearer {token}"`,
      },
      {
        method: "POST", path: "/api/contributions",
        desc: "Enregistrer une cotisation",
        auth: true,
        body: `{
  "tontineId": "xxx",
  "amount": 25000,
  "paymentMethod": "MTN_MOMO",
  "type": "COTISATION"
}`,
        response: `{ "id": "...", "amount": 25000, "status": "PAID" }`,
        example: `curl -X POST https://votre-domaine.com/api/contributions \\
  -H "Authorization: Bearer {token}" \\
  -d '{"tontineId":"xxx","amount":25000,"paymentMethod":"MTN_MOMO"}'`,
      },
    ],
  },
  {
    group: "Prêts & Microfinance",
    color: "#7c3aed",
    routes: [
      {
        method: "GET", path: "/api/loans",
        desc: "Liste les prêts (filtres: tontineId, status)",
        auth: true,
        response: `[{ "id":"...", "amount":75000, "interestRate":5, "duration":3, "status":"REPAYING" }]`,
        example: `curl "https://votre-domaine.com/api/loans?tontineId=xxx" \\
  -H "Authorization: Bearer {token}"`,
      },
      {
        method: "POST", path: "/api/loans",
        desc: "Demander un prêt interne",
        auth: true,
        body: `{ "tontineId":"xxx", "amount":75000, "interestRate":5, "duration":3, "purpose":"Achat stock" }`,
        response: `{ "id":"...", "amount":75000, "status":"PENDING" }`,
        example: `curl -X POST https://votre-domaine.com/api/loans \\
  -H "Authorization: Bearer {token}" \\
  -d '{"tontineId":"xxx","amount":75000,"interestRate":5,"duration":3}'`,
      },
    ],
  },
  {
    group: "Upload de fichiers",
    color: "#0891b2",
    routes: [
      {
        method: "POST", path: "/api/upload",
        desc: "Uploader un PDF ou une image (multipart/form-data). Max 10MB.",
        auth: true,
        body: `FormData:
  file: <fichier.pdf>
  tontineId: "xxx"
  type: "REGLEMENT"
  name: "Règlement intérieur 2025"`,
        response: `{ "id":"...", "name":"Règlement intérieur 2025", "url":"/uploads/tontines/xxx/1234.pdf" }`,
        example: `curl -X POST https://votre-domaine.com/api/upload \\
  -H "Authorization: Bearer {token}" \\
  -F "file=@reglement.pdf" \\
  -F "tontineId=xxx" \\
  -F "type=REGLEMENT" \\
  -F "name=Règlement intérieur"`,
      },
    ],
  },
  {
    group: "Rapports",
    color: "#b45309",
    routes: [
      {
        method: "GET", path: "/api/reports/consolidated",
        desc: "Rapport croisé multi-tontines : totaux, évolution mensuelle, score",
        auth: true,
        response: `{
  "totalContributed": 150000,
  "totalReceived": 300000,
  "netBalance": 150000,
  "tontinesBreakdown": [...],
  "monthlyEvolution": [...],
  "scoring": { "total": 250, "level": "ACTIF" }
}`,
        example: `curl https://votre-domaine.com/api/reports/consolidated \\
  -H "Authorization: Bearer {token}"`,
      },
    ],
  },
];

const codeExamples = {
  js: `// JavaScript / Node.js
const BASE = "https://votre-domaine.com/api";

async function login(email, password) {
  const res = await fetch(\`\${BASE}/auth/signin\`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const { token } = await res.json();
  return token;
}

async function getTontines(token) {
  const res = await fetch(\`\${BASE}/tontines?mine=true\`, {
    headers: { Authorization: \`Bearer \${token}\` },
  });
  return res.json();
}

// Usage
const token = await login("demo@tchoua.cm", "demo123");
const { tontines } = await getTontines(token);
console.log(tontines);`,

  python: `# Python
import requests

BASE = "https://votre-domaine.com/api"

def login(email, password):
    r = requests.post(f"{BASE}/auth/signin",
        json={"email": email, "password": password})
    return r.json()["token"]

def get_tontines(token):
    r = requests.get(f"{BASE}/tontines",
        params={"mine": "true"},
        headers={"Authorization": f"Bearer {token}"})
    return r.json()["tontines"]

# Usage
token = login("demo@tchoua.cm", "demo123")
tontines = get_tontines(token)
print(tontines)`,

  curl: `# cURL — Exemple complet

# 1. Connexion
TOKEN=$(curl -s -X POST https://votre-domaine.com/api/auth/signin \\
  -H "Content-Type: application/json" \\
  -d '{"email":"demo@tchoua.cm","password":"demo123"}' \\
  | jq -r '.token')

# 2. Récupérer les tontines
curl https://votre-domaine.com/api/tontines?mine=true \\
  -H "Authorization: Bearer $TOKEN"

# 3. Uploader un PDF
curl -X POST https://votre-domaine.com/api/upload \\
  -H "Authorization: Bearer $TOKEN" \\
  -F "file=@reglement.pdf" \\
  -F "tontineId=TONTINE_ID" \\
  -F "type=REGLEMENT"`,
};

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative rounded-xl overflow-hidden" style={{ background: "#0a1628" }}>
      <button
        onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
        className="absolute top-3 right-3 p-1.5 rounded-lg transition-colors"
        style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}>
        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
      </button>
      <pre className="p-4 text-xs text-green-300 overflow-x-auto leading-relaxed">{code}</pre>
    </div>
  );
}

const methodColors: Record<string, string> = {
  GET: "#059669", POST: "#7c3aed", DELETE: "#dc2626", PATCH: "#d97706", PUT: "#2563eb",
};

export default function DocsPage() {
  const [activeGroup, setActiveGroup] = useState(0);
  const [activeRoute, setActiveRoute] = useState(0);
  const [codeLang, setCodeLang] = useState<"js" | "python" | "curl">("curl");

  const group = endpoints[activeGroup];
  const route = group?.routes[activeRoute];

  return (
    <AdaptiveLayout title="Documentation API">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="rounded-2xl p-6 text-white" style={{ background: "linear-gradient(135deg, #0a1628, #1a2d4a)" }}>
          <div className="flex items-center gap-3 mb-2">
            <Terminal className="w-7 h-7 text-green-400" />
            <h1 className="text-xl font-bold">Documentation Développeur & API REST</h1>
          </div>
          <p className="text-white/60 text-sm mb-4">Base URL : <code className="text-green-300">https://votre-domaine.com/api</code></p>
          <div className="flex items-center gap-3 flex-wrap">
            {[
              { label: "Auth : Bearer JWT", color: "#059669" },
              { label: "Format : JSON", color: "#7c3aed" },
              { label: "Open Source MIT", color: "#e68a00" },
            ].map(b => (
              <span key={b.label} className="px-2.5 py-1 rounded-full text-xs font-semibold"
                style={{ background: `${b.color}20`, color: b.color, border: `1px solid ${b.color}40` }}>
                {b.label}
              </span>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar nav */}
          <div className="space-y-1">
            {endpoints.map((ep, gi) => (
              <div key={gi}>
                <button
                  onClick={() => { setActiveGroup(gi); setActiveRoute(0); }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all text-left"
                  style={activeGroup === gi
                    ? { background: ep.color + "15", color: ep.color }
                    : { color: "#6b7280" }}>
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: ep.color }} />
                  {ep.group}
                </button>
                {activeGroup === gi && ep.routes.map((r, ri) => (
                  <button key={ri}
                    onClick={() => setActiveRoute(ri)}
                    className="w-full flex items-center gap-2 pl-6 pr-3 py-1.5 text-xs text-left transition-all"
                    style={{ color: activeRoute === ri ? "#0d3d28" : "#9ca3af" }}>
                    <span className="font-mono font-bold text-[10px]" style={{ color: methodColors[r.method] }}>{r.method}</span>
                    <span className="truncate">{r.path}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>

          {/* Route detail */}
          <div className="lg:col-span-3 space-y-4">
            {route && (
              <>
                <div className="bg-white rounded-2xl border border-[#e2ddd4] p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold font-mono"
                      style={{ background: methodColors[route.method] + "15", color: methodColors[route.method] }}>
                      {route.method}
                    </span>
                    <code className="text-sm font-mono" style={{ color: "#0d3d28" }}>{route.path}</code>
                    {route.auth && (
                      <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ background: "#fef9f0", color: "#e68a00", border: "1px solid #e68a00" }}>
                        🔒 Auth requise
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm">{route.desc}</p>
                </div>

                {route.body && (
                  <div className="bg-white rounded-2xl border border-[#e2ddd4] p-6">
                    <h3 className="font-semibold text-sm mb-3" style={{ color: "#0d3d28" }}>Corps de la requête</h3>
                    <CodeBlock code={route.body} />
                  </div>
                )}

                <div className="bg-white rounded-2xl border border-[#e2ddd4] p-6">
                  <h3 className="font-semibold text-sm mb-3" style={{ color: "#0d3d28" }}>Réponse</h3>
                  <CodeBlock code={route.response || ""} />
                </div>

                <div className="bg-white rounded-2xl border border-[#e2ddd4] p-6">
                  <h3 className="font-semibold text-sm mb-3" style={{ color: "#0d3d28" }}>Exemple cURL</h3>
                  <CodeBlock code={route.example} />
                </div>
              </>
            )}

            {/* Code examples section */}
            <div className="bg-white rounded-2xl border border-[#e2ddd4] p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold" style={{ color: "#0d3d28" }}>Exemples par langage</h3>
                <div className="flex gap-1">
                  {(["curl", "js", "python"] as const).map(l => (
                    <button key={l} onClick={() => setCodeLang(l)}
                      className="px-3 py-1 rounded-lg text-xs font-semibold transition-all"
                      style={codeLang === l ? { background: "#0d3d28", color: "white" } : { background: "#f7f3eb", color: "#6b7280" }}>
                      {l === "js" ? "JavaScript" : l === "python" ? "Python" : "cURL"}
                    </button>
                  ))}
                </div>
              </div>
              <CodeBlock code={codeExamples[codeLang]} />
            </div>
          </div>
        </div>
      </div>
    </AdaptiveLayout>
  );
}
