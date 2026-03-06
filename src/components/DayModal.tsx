import {
  Dialog,
  DialogTitle,
  DialogPanel,
  TransitionChild,
  Transition,
} from "@headlessui/react";
import { Fragment, useState, useEffect } from "react";
import { Nurse, DaySchedule } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DayModalProps {
  isOpen: boolean;
  onClose: () => void;
  daySchedule: DaySchedule;
  nurses: Nurse[];
  onSave: (
    type: "diurno" | "noturno",
    nurseId: string | null,
    isFolga: boolean,
  ) => void;
}

export function DayModal({
  isOpen,
  onClose,
  daySchedule,
  nurses,
  onSave,
}: DayModalProps) {
  const [selectedDiurno, setSelectedDiurno] = useState(
    daySchedule.diurno.nurseId,
  );
  const [diurnoFolga, setDiurnoFolga] = useState(
    daySchedule.diurno.isFolga || false,
  );

  const [selectedNoturno, setSelectedNoturno] = useState(
    daySchedule.noturno.nurseId,
  );
  const [noturnoFolga, setNoturnoFolga] = useState(
    daySchedule.noturno.isFolga || false,
  );

  useEffect(() => {
    setSelectedDiurno(daySchedule.diurno.nurseId);
    setDiurnoFolga(daySchedule.diurno.isFolga || false);
    setSelectedNoturno(daySchedule.noturno.nurseId);
    setNoturnoFolga(daySchedule.noturno.isFolga || false);
  }, [daySchedule]);

  const handleSave = () => {
    onSave("diurno", selectedDiurno, diurnoFolga);
    onSave("noturno", selectedNoturno, noturnoFolga);
    onClose();
  };

  const folguista = nurses.find((n) => n.role === "folguista");
  const standardNurses = nurses.filter((n) => n.role === "padrao");

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
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-slate-800 p-6 text-left align-middle shadow-xl transition-all border border-slate-700">
                <DialogTitle
                  as="h3"
                  className="text-lg font-medium leading-6 text-white mb-4 capitalize"
                >
                  {daySchedule.date &&
                    format(new Date(daySchedule.date), "EEEE, d 'de' MMMM", {
                      locale: ptBR,
                    })}
                </DialogTitle>

                <div className="space-y-6">
                  {/* Diurno Section */}
                  <div className="bg-slate-700/50 p-4 rounded-xl border border-slate-600">
                    <div className="flex justify-between items-center mb-2">
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
                        Plantão Diurno
                      </h4>
                      <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={diurnoFolga}
                          onChange={(e) => setDiurnoFolga(e.target.checked)}
                          className="rounded border-slate-500 bg-slate-800 text-yellow-500 focus:ring-yellow-500/50"
                        />
                        Folga (Cobrir)
                      </label>
                    </div>

                    <select
                      value={selectedDiurno || ""}
                      onChange={(e) =>
                        setSelectedDiurno(e.target.value || null)
                      }
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

                    {diurnoFolga && folguista && (
                      <div className="mt-2 text-sm text-emerald-400 flex items-center gap-2 bg-emerald-400/10 p-2 rounded">
                        <span>Cobertura automática:</span>
                        <span className="font-bold">{folguista.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Noturno Section */}
                  <div className="bg-slate-700/50 p-4 rounded-xl border border-slate-600">
                    <div className="flex justify-between items-center mb-2">
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
                        Plantão Noturno
                      </h4>
                      <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={noturnoFolga}
                          onChange={(e) => setNoturnoFolga(e.target.checked)}
                          className="rounded border-slate-500 bg-slate-800 text-indigo-500 focus:ring-indigo-500/50"
                        />
                        Folga (Cobrir)
                      </label>
                    </div>

                    <select
                      value={selectedNoturno || ""}
                      onChange={(e) =>
                        setSelectedNoturno(e.target.value || null)
                      }
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

                    {noturnoFolga && folguista && (
                      <div className="mt-2 text-sm text-emerald-400 flex items-center gap-2 bg-emerald-400/10 p-2 rounded">
                        <span>Cobertura automática:</span>
                        <span className="font-bold">{folguista.name}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
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
                    Salvar Alterações
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
