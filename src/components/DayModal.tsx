import {
  Dialog,
  DialogTitle,
  DialogPanel,
  TransitionChild,
  Transition,
} from "@headlessui/react";
import { Fragment, useState, useEffect } from "react";
import { Nurse, DaySchedule } from "@/types";
import { format, parse } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface DayModalProps {
  isOpen: boolean;
  onClose: () => void;
  daySchedule: DaySchedule;
  nurses: Nurse[];
  onSave: (
    type: "diurno" | "noturno",
    nurseId: string | null,
    isFolga: boolean,
    folguistaId: string | null,
  ) => void;
}

export function DayModal({
  isOpen,
  onClose,
  daySchedule,
  nurses,
  onSave,
}: DayModalProps) {
  const standardNurses = nurses.filter((n) => n.role === "padrao");
  const folguistas = nurses.filter((n) => n.role === "folguista");
  const firstFolguistaId = folguistas[0]?.id ?? null;

  const [selectedDiurno, setSelectedDiurno] = useState(
    daySchedule.diurno.nurseId,
  );
  const [diurnoFolga, setDiurnoFolga] = useState(
    daySchedule.diurno.isFolga || false,
  );
  const [selectedDiurnoFolguista, setSelectedDiurnoFolguista] = useState(
    daySchedule.diurno.folguistaId || firstFolguistaId,
  );

  const [selectedNoturno, setSelectedNoturno] = useState(
    daySchedule.noturno.nurseId,
  );
  const [noturnoFolga, setNoturnoFolga] = useState(
    daySchedule.noturno.isFolga || false,
  );
  const [selectedNoturnoFolguista, setSelectedNoturnoFolguista] = useState(
    daySchedule.noturno.folguistaId || firstFolguistaId,
  );
  const modalDate = daySchedule.date
    ? parse(daySchedule.date, "yyyy-MM-dd", new Date())
    : null;

  useEffect(() => {
    setSelectedDiurno(daySchedule.diurno.nurseId);
    setDiurnoFolga(daySchedule.diurno.isFolga || false);
    setSelectedDiurnoFolguista(
      daySchedule.diurno.folguistaId || firstFolguistaId,
    );
    setSelectedNoturno(daySchedule.noturno.nurseId);
    setNoturnoFolga(daySchedule.noturno.isFolga || false);
    setSelectedNoturnoFolguista(
      daySchedule.noturno.folguistaId || firstFolguistaId,
    );
  }, [daySchedule, firstFolguistaId]);

  const handleSave = () => {
    const nextDiurno = {
      nurseId: selectedDiurno,
      isFolga: diurnoFolga,
      folguistaId: diurnoFolga ? selectedDiurnoFolguista : null,
    };
    const currentDiurno = {
      nurseId: daySchedule.diurno.nurseId,
      isFolga: daySchedule.diurno.isFolga || false,
      folguistaId: daySchedule.diurno.isFolga
        ? (daySchedule.diurno.folguistaId ?? null)
        : null,
    };
    const diurnoChanged =
      nextDiurno.nurseId !== currentDiurno.nurseId ||
      nextDiurno.isFolga !== currentDiurno.isFolga ||
      nextDiurno.folguistaId !== currentDiurno.folguistaId;

    if (diurnoChanged) {
      onSave(
        "diurno",
        nextDiurno.nurseId,
        nextDiurno.isFolga,
        nextDiurno.folguistaId,
      );
    }

    const nextNoturno = {
      nurseId: selectedNoturno,
      isFolga: noturnoFolga,
      folguistaId: noturnoFolga ? selectedNoturnoFolguista : null,
    };
    const currentNoturno = {
      nurseId: daySchedule.noturno.nurseId,
      isFolga: daySchedule.noturno.isFolga || false,
      folguistaId: daySchedule.noturno.isFolga
        ? (daySchedule.noturno.folguistaId ?? null)
        : null,
    };
    const noturnoChanged =
      nextNoturno.nurseId !== currentNoturno.nurseId ||
      nextNoturno.isFolga !== currentNoturno.isFolga ||
      nextNoturno.folguistaId !== currentNoturno.folguistaId;

    if (noturnoChanged) {
      onSave(
        "noturno",
        nextNoturno.nurseId,
        nextNoturno.isFolga,
        nextNoturno.folguistaId,
      );
    }

    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-3 text-center sm:p-4">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-lg transform overflow-hidden rounded-2xl border border-slate-700 bg-slate-800 p-4 text-left align-middle shadow-xl transition-all sm:p-6">
                <DialogTitle
                  as="h3"
                  className="mb-4 text-base font-medium leading-6 text-white capitalize sm:text-lg"
                >
                  {modalDate &&
                    format(modalDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
                </DialogTitle>

                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-slate-700/50 p-3 sm:p-4 rounded-xl border border-slate-600">
                    <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <h4 className="text-yellow-400 font-semibold flex items-center gap-2">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                          />
                        </svg>
                        Plantao Diurno
                      </h4>
                      <label
                        className={cn(
                          "inline-flex cursor-pointer select-none items-center gap-2 rounded-lg border px-2.5 py-1.5 text-sm transition-colors",
                          diurnoFolga
                            ? "border-amber-400/60 bg-amber-500/20 text-amber-100"
                            : "border-slate-600 bg-slate-800/60 text-slate-300 hover:border-slate-500 hover:bg-slate-700/80",
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={diurnoFolga}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setDiurnoFolga(checked);
                            if (checked && !selectedDiurnoFolguista) {
                              setSelectedDiurnoFolguista(firstFolguistaId);
                            }
                          }}
                          className="peer sr-only"
                        />
                        <span
                          className={cn(
                            "relative h-5 w-9 rounded-full transition-colors",
                            diurnoFolga ? "bg-amber-400/70" : "bg-slate-500/60",
                          )}
                        >
                          <span
                            className={cn(
                              "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
                              diurnoFolga ? "translate-x-4" : "translate-x-0.5",
                            )}
                          />
                        </span>
                        <span className="font-medium">Folguista (a cobrir)</span>
                      </label>
                    </div>

                    <select
                      value={selectedDiurno || ""}
                      onChange={(e) => setSelectedDiurno(e.target.value || null)}
                      className="w-full bg-slate-800 border-slate-600 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-yellow-500/50 outline-none"
                    >
                      <option value="">Selecione um enfermeiro...</option>
                      {standardNurses
                        .filter((n) => n.id !== selectedNoturno)
                        .map((nurse) => (
                          <option key={nurse.id} value={nurse.id}>
                            {nurse.name}
                          </option>
                        ))}
                    </select>

                    {diurnoFolga && (
                      <div className="mt-2 rounded border border-emerald-500/30 bg-emerald-500/10 p-2">
                        {folguistas.length > 0 ? (
                          <div className="space-y-1">
                            <span className="text-xs uppercase tracking-wide text-emerald-300">
                              Folguista de cobertura
                            </span>
                            <select
                              value={selectedDiurnoFolguista || ""}
                              onChange={(e) =>
                                setSelectedDiurnoFolguista(
                                  e.target.value || null,
                                )
                              }
                              className="w-full bg-slate-800 border-slate-600 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500/50 outline-none"
                            >
                              {folguistas.map((nurse) => (
                                <option key={nurse.id} value={nurse.id}>
                                  {nurse.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <span className="text-sm text-amber-300">
                            Nenhum folguista cadastrado para cobertura.
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-700/50 p-3 sm:p-4 rounded-xl border border-slate-600">
                    <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <h4 className="text-indigo-400 font-semibold flex items-center gap-2">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                          />
                        </svg>
                        Plantao Noturno
                      </h4>
                      <label
                        className={cn(
                          "inline-flex cursor-pointer select-none items-center gap-2 rounded-lg border px-2.5 py-1.5 text-sm transition-colors",
                          noturnoFolga
                            ? "border-indigo-400/60 bg-indigo-500/20 text-indigo-100"
                            : "border-slate-600 bg-slate-800/60 text-slate-300 hover:border-slate-500 hover:bg-slate-700/80",
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={noturnoFolga}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setNoturnoFolga(checked);
                            if (checked && !selectedNoturnoFolguista) {
                              setSelectedNoturnoFolguista(firstFolguistaId);
                            }
                          }}
                          className="peer sr-only"
                        />
                        <span
                          className={cn(
                            "relative h-5 w-9 rounded-full transition-colors",
                            noturnoFolga ? "bg-indigo-400/70" : "bg-slate-500/60",
                          )}
                        >
                          <span
                            className={cn(
                              "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
                              noturnoFolga ? "translate-x-4" : "translate-x-0.5",
                            )}
                          />
                        </span>
                        <span className="font-medium">Folguista (a cobrir)</span>
                      </label>
                    </div>

                    <select
                      value={selectedNoturno || ""}
                      onChange={(e) => setSelectedNoturno(e.target.value || null)}
                      className="w-full bg-slate-800 border-slate-600 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500/50 outline-none"
                    >
                      <option value="">Selecione um enfermeiro...</option>
                      {standardNurses
                        .filter((n) => n.id !== selectedDiurno)
                        .map((nurse) => (
                          <option key={nurse.id} value={nurse.id}>
                            {nurse.name}
                          </option>
                        ))}
                    </select>

                    {noturnoFolga && (
                      <div className="mt-2 rounded border border-emerald-500/30 bg-emerald-500/10 p-2">
                        {folguistas.length > 0 ? (
                          <div className="space-y-1">
                            <span className="text-xs uppercase tracking-wide text-emerald-300">
                              Folguista de cobertura
                            </span>
                            <select
                              value={selectedNoturnoFolguista || ""}
                              onChange={(e) =>
                                setSelectedNoturnoFolguista(
                                  e.target.value || null,
                                )
                              }
                              className="w-full bg-slate-800 border-slate-600 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500/50 outline-none"
                            >
                              {folguistas.map((nurse) => (
                                <option key={nurse.id} value={nurse.id}>
                                  {nurse.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <span className="text-sm text-amber-300">
                            Nenhum folguista cadastrado para cobertura.
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex flex-col-reverse gap-2 sm:mt-8 sm:flex-row sm:justify-end sm:gap-3">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-lg border border-transparent bg-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
                    onClick={onClose}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-lg border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={handleSave}
                  >
                    Salvar Alteracoes
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
