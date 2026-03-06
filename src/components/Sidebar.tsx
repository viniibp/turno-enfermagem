import { useState, useMemo } from "react";
import type { SubmitEvent } from "react";
import { Nurse } from "@/types";
import { cn } from "@/lib/utils";
import { NURSE_COLORS } from "@/constants/colors";

interface SidebarProps {
  nurses: Nurse[];
  onAddNurse: (
    name: string,
    role: "padrao" | "folguista",
    color: string,
  ) => void;
  onRemoveNurse: (nurseId: string) => void;
  onOpenAutoSchedule: () => void;
  onCloseMobile?: () => void;
}

export function Sidebar({
  nurses,
  onAddNurse,
  onRemoveNurse,
  onOpenAutoSchedule,
  onCloseMobile,
}: SidebarProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<"padrao" | "folguista">("padrao");
  const [selectedColor, setSelectedColor] = useState<string>("");

  const usedColors = useMemo(
    () => new Set(nurses.map((n) => n.color)),
    [nurses],
  );
  const availableColors = useMemo(
    () => NURSE_COLORS.filter((c) => !usedColors.has(c)),
    [usedColors],
  );

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    if (newName.trim() && selectedColor) {
      onAddNurse(newName, newRole, selectedColor);
      setNewName("");
      setSelectedColor("");
      setIsAdding(false);
    }
  };

  return (
    <div className="h-full bg-slate-900 border-r border-slate-800 p-4 sm:p-6 flex flex-col overflow-hidden">
      <div className="mb-8 shrink-0">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">
              Escala Enfermagem
            </h1>
            <p className="text-slate-400 text-sm">Gerenciamento de plantoes</p>
          </div>
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden rounded-lg border border-slate-700 p-2 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Fechar menu"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        <button
          onClick={onOpenAutoSchedule}
          className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-blue-400 text-xs font-bold uppercase tracking-wide py-3 rounded-xl border border-slate-700 transition-all shadow-sm group"
        >
          <svg
            className="w-4 h-4 group-hover:scale-110 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
            />
          </svg>
          Gerar Escala Padrao
        </button>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 pr-2">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Equipe
          </h2>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="text-xs text-blue-400 hover:text-blue-300 font-medium"
          >
            {isAdding ? "Cancelar" : "+ Adicionar"}
          </button>
        </div>

        {isAdding && (
          <form
            onSubmit={handleSubmit}
            className="mb-6 bg-slate-800 p-3 rounded-xl border border-slate-700"
          >
            <input
              type="text"
              placeholder="Nome do enfermeiro"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white mb-2 focus:outline-none focus:border-blue-500"
              autoFocus
            />
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setNewRole("padrao")}
                className={cn(
                  "flex-1 text-xs py-1.5 rounded-md border transition-colors",
                  newRole === "padrao"
                    ? "bg-blue-500/20 border-blue-500 text-blue-200"
                    : "border-slate-700 text-slate-400 hover:bg-slate-700",
                )}
              >
                Padrao
              </button>
              <button
                type="button"
                onClick={() => setNewRole("folguista")}
                className={cn(
                  "flex-1 text-xs py-1.5 rounded-md border transition-colors",
                  newRole === "folguista"
                    ? "bg-rose-500/20 border-rose-500 text-rose-200"
                    : "border-slate-700 text-slate-400 hover:bg-slate-700",
                )}
              >
                Folguista
              </button>
            </div>

            <div className="mb-4">
              <label className="text-xs text-slate-500 mb-2 block uppercase font-semibold">
                Cor
              </label>
              <div className="grid grid-cols-6 gap-2">
                {availableColors.map((color) => {
                  const isSelected = selectedColor === color;

                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={cn(
                        "w-6 h-6 rounded-full transition-all relative",
                        color,
                        isSelected &&
                          "ring-2 ring-white ring-offset-2 ring-offset-slate-800 scale-110",
                        !isSelected && "hover:scale-110 hover:opacity-90",
                      )}
                      title="Selecionar cor"
                    >
                      {isSelected && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={!newName.trim() || !selectedColor}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-2 rounded-lg transition-colors"
            >
              Salvar
            </button>
          </form>
        )}

        <div className="space-y-6">
          <div>
            <h3 className="text-xs font-semibold text-slate-600 mb-3 uppercase">
              Plantonistas
            </h3>
            <div className="space-y-3">
              {nurses
                .filter((n) => n.role === "padrao")
                .map((nurse) => (
                  <div
                    key={nurse.id}
                    className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 hover:border-slate-600 transition-colors group"
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm",
                        nurse.color,
                      )}
                    >
                      {nurse.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-slate-200 font-medium text-sm group-hover:text-white transition-colors">
                        {nurse.name}
                      </p>
                      <p className="text-slate-500 text-xs">Padrao</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveNurse(nurse.id)}
                      className="ml-auto rounded-md p-2 text-slate-500 hover:bg-slate-700 hover:text-rose-300 transition-colors"
                      aria-label={`Apagar ${nurse.name}`}
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 7h12M9 7V5h6v2m-7 0v12m4-12v12m4-12v12M5 7l1 13h12l1-13"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-600 mb-3 uppercase">
              Cobertura
            </h3>
            <div className="space-y-3">
              {nurses
                .filter((n) => n.role === "folguista")
                .map((nurse) => (
                  <div
                    key={nurse.id}
                    className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 hover:border-slate-600 transition-colors group"
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm",
                        nurse.color,
                      )}
                    >
                      {nurse.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-slate-200 font-medium text-sm group-hover:text-white transition-colors">
                        {nurse.name}
                      </p>
                      <p className="text-slate-500 text-xs">Folguista</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveNurse(nurse.id)}
                      className="ml-auto rounded-md p-2 text-slate-500 hover:bg-slate-700 hover:text-rose-300 transition-colors"
                      aria-label={`Apagar ${nurse.name}`}
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 7h12M9 7V5h6v2m-7 0v12m4-12v12m4-12v12M5 7l1 13h12l1-13"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-6 border-t border-slate-800 shrink-0">
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700/50">
          <h3 className="text-white font-medium text-sm mb-2">Resumo da Equipe</h3>
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Total</span>
            <span>{nurses.length} profissionais</span>
          </div>
        </div>
      </div>
    </div>
  );
}
