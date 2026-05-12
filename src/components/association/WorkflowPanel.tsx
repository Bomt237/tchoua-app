"use client";

import { useEffect, useState } from "react";
import { Loader2, Workflow } from "lucide-react";

interface ApprovalWorkflow {
  id: string;
  name: string;
  entityType: string;
  votingLevel: string;
  minVotesRequired?: number | null;
  timeoutHours: number;
  isActive: boolean;
  createdAt: string;
}

interface WorkflowPanelProps {
  associationId: string;
}

const ENTITY_LABELS: Record<string, string> = {
  LOAN: "Prêt",
  SOCIAL_AID: "Aide sociale",
  SANCTION: "Sanction",
  ACTIVITY: "Activité",
  MEMBERSHIP_ACTION: "Action membre",
  DISSOLUTION: "Dissolution",
};

const LEVEL_LABELS: Record<string, string> = {
  ROUTINE: "Routine (33 %)",
  STANDARD: "Standard (50 %)",
  IMPORTANT: "Important (66 %)",
  CRITICAL: "Critique (75 %)",
  CONSTITUTIONAL: "Constitutionnel (100 %)",
};

export default function WorkflowPanel({ associationId }: WorkflowPanelProps) {
  const [workflows, setWorkflows] = useState<ApprovalWorkflow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkflows();
  }, [associationId]);

  async function fetchWorkflows() {
    setLoading(true);
    try {
      const res = await fetch(`/api/associations/${associationId}/workflows`);
      if (res.ok) {
        const data = await res.json();
        setWorkflows(data.workflows || []);
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
        <h3 className="text-lg font-semibold text-[#0d3d28]">Workflows d&apos;approbation</h3>
      </div>

      {workflows.length === 0 ? (
        <div className="text-center py-10 text-gray-400 text-sm">
          <Workflow className="w-8 h-8 mx-auto mb-2 opacity-50" />
          Aucun workflow configuré
        </div>
      ) : (
        <div className="space-y-3">
          {workflows.map((wf) => (
            <div
              key={wf.id}
              className="flex items-center justify-between p-3 rounded-xl bg-[#faf9f6] border border-gray-100"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{wf.name}</p>
                <p className="text-xs text-gray-500">
                  {ENTITY_LABELS[wf.entityType] || wf.entityType} · Délai {wf.timeoutHours}h
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs px-2 py-1 rounded-full font-medium bg-[#e68a00]/10 text-[#e68a00]">
                  {LEVEL_LABELS[wf.votingLevel] || wf.votingLevel}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    wf.isActive
                      ? "bg-green-50 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {wf.isActive ? "Actif" : "Inactif"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
