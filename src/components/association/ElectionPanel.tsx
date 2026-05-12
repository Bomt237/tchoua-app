"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Vote } from "lucide-react";

interface Election {
  id: string;
  title: string;
  type: string;
  status: string;
  startDate?: string | null;
  endDate?: string | null;
  quorumRequired?: number | null;
  quorumReached: boolean;
  createdAt: string;
}

interface ElectionPanelProps {
  associationId: string;
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Brouillon",
  OPEN: "Ouverte",
  CLOSED: "Clôturée",
  CANCELLED: "Annulée",
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600",
  OPEN: "bg-green-50 text-green-700",
  CLOSED: "bg-blue-50 text-blue-700",
  CANCELLED: "bg-red-50 text-red-700",
};

export default function ElectionPanel({ associationId }: ElectionPanelProps) {
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchElections();
  }, [associationId]);

  async function fetchElections() {
    setLoading(true);
    try {
      const res = await fetch(`/api/associations/${associationId}/elections`);
      if (res.ok) {
        const data = await res.json();
        setElections(data.elections || []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-[#0d3d28]" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[#0d3d28]">Élections</h3>
        <button
          onClick={() => {
            // Placeholder: navigation or modal trigger
            alert("Fonctionnalité à implémenter : créer une nouvelle élection");
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-[#0d3d28] hover:bg-[#0a2e1e] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouvelle élection
        </button>
      </div>

      {elections.length === 0 ? (
        <div className="text-center py-10 text-gray-400 text-sm">
          <Vote className="w-8 h-8 mx-auto mb-2 opacity-50" />
          Aucune élection enregistrée
        </div>
      ) : (
        <div className="space-y-3">
          {elections.map((election) => (
            <div
              key={election.id}
              className="flex items-center justify-between p-3 rounded-xl bg-[#faf9f6] border border-gray-100"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{election.title}</p>
                <p className="text-xs text-gray-500">
                  {election.type === "BUREAU"
                    ? "Bureau"
                    : election.type === "PRESIDENT"
                    ? "Président"
                    : election.type}
                  {" · "}
                  {election.startDate
                    ? new Date(election.startDate).toLocaleDateString("fr-FR")
                    : "Non programmée"}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {election.quorumRequired != null && (
                  <span className="text-xs text-gray-400">
                    Quorum {election.quorumReached ? "✓" : "…"}
                  </span>
                )}
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    STATUS_COLORS[election.status] || "bg-gray-100 text-gray-600"
                  }`}
                >
                  {STATUS_LABELS[election.status] || election.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
