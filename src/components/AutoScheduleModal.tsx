import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Fragment, useState } from "react";
import { Nurse } from "@/types";

interface AutoScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  nurses: Nurse[];
  onGenerate: (
    diurnoParId: string | null,
    diurnoImparId: string | null,
    noturnoParId: string | null,
    noturnoImparId: string | null,
  ) => void;
}

export function AutoScheduleModal({
  isOpen,
  onClose,
  nurses,
  onGenerate,
}: AutoScheduleModalProps) {
  const [diurnoPar, setDiurnoPar] = useState<string>("");
  const [diurnoImpar, setDiurnoImpar] = useState<string>("");
  const [noturnoPar, setNoturnoPar] = useState<string>("");
  const [noturnoImpar, setNoturnoImpar] = useState<string>("");

  const handleGenerate = () => {
    onGenerate(
      diurnoPar || null,
      diurnoImpar || null,
      noturnoPar || null,
      noturnoImpar || null,
    );
    onClose();
  };

  const standardNurses = nurses.filter((n) => n.role === "padrao");

  const getAvailableNurses = (currentValue: string) => {
    const selectedIds = [
      diurnoPar,
      diurnoImpar,
      noturnoPar,
      noturnoImpar,
    ].filter((id) => id && id !== currentValue);
    return standardNurses.filter((n) => !selectedIds.includes(n.id));
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
              <DialogPanel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-slate-800 p-8 text-left align-middle shadow-xl transition-all border border-slate-700">
                <DialogTitle
                  as="h3"
                  className="text-xl font-bold leading-6 text-white mb-6"
                >
                  Configurar Escala Padrão (Par/Ímpar)
                </DialogTitle>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Diurno Column */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-yellow-400 font-semibold border-b border-slate-700 pb-2">
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
                      <h3>Plantão Diurno</h3>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">
                          Dias Pares (2, 4, 6...)
                        </label>
                        <select
                          value={diurnoPar}
                          onChange={(e) => setDiurnoPar(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-yellow-500/50 outline-none"
                        >
                          <option value="">Selecione...</option>
                          {getAvailableNurses(diurnoPar).map((n) => (
                            <option key={n.id} value={n.id}>
                              {n.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">
                          Dias Ímpares (1, 3, 5...)
                        </label>
                        <select
                          value={diurnoImpar}
                          onChange={(e) => setDiurnoImpar(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-yellow-500/50 outline-none"
                        >
                          <option value="">Selecione...</option>
                          {getAvailableNurses(diurnoImpar).map((n) => (
                            <option key={n.id} value={n.id}>
                              {n.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Noturno Column */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-indigo-400 font-semibold border-b border-slate-700 pb-2">
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
                      <h3>Plantão Noturno</h3>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">
                          Dias Pares (2, 4, 6...)
                        </label>
                        <select
                          value={noturnoPar}
                          onChange={(e) => setNoturnoPar(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-indigo-500/50 outline-none"
                        >
                          <option value="">Selecione...</option>
                          {getAvailableNurses(noturnoPar).map((n) => (
                            <option key={n.id} value={n.id}>
                              {n.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">
                          Dias Ímpares (1, 3, 5...)
                        </label>
                        <select
                          value={noturnoImpar}
                          onChange={(e) => setNoturnoImpar(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-indigo-500/50 outline-none"
                        >
                          <option value="">Selecione...</option>
                          {getAvailableNurses(noturnoImpar).map((n) => (
                            <option key={n.id} value={n.id}>
                              {n.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-700 flex justify-end gap-3">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                    onClick={onClose}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-colors shadow-lg shadow-blue-900/20"
                    onClick={handleGenerate}
                  >
                    Gerar Escala Automática
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
