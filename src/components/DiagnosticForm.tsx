import React from 'react';
import { ArrowRight, FileText, RotateCcw, AlertCircle } from 'lucide-react';
import {
  DIAGNOSTIC_QUESTIONS,
  DIAGNOSTIC_SECTIONS,
  type AnswersMap,
} from '../data/interviewQuestions';

interface DiagnosticFormProps {
  answers: AnswersMap;
  isAnalyzing: boolean;
  errorMessage: string | null;
  validationError: string | null;
  onChangeAnswer: (id: number, value: string) => void;
  onLoadSample: () => void;
  onResetForm: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const DiagnosticForm: React.FC<DiagnosticFormProps> = ({
  answers,
  isAnalyzing,
  errorMessage,
  validationError,
  onChangeAnswer,
  onLoadSample,
  onResetForm,
  onSubmit,
}) => {
  const answeredCount = DIAGNOSTIC_QUESTIONS.filter(
    (q) => (answers[q.id] ?? '').trim().length > 0
  ).length;
  const totalCount = DIAGNOSTIC_QUESTIONS.length;
  const progressPercent = Math.round((answeredCount / totalCount) * 100);

  return (
    <div className="mx-auto max-w-[1320px] px-6 py-10">
      <div className="mb-10 border-b border-slate-200 pb-8">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
          <span>Diagnóstico Logístico en Planta</span>
          <span aria-hidden="true">·</span>
          <span>Rapi Tienda D y D</span>
          <span aria-hidden="true">·</span>
          <span>Método ABC y Ronald H. Ballou</span>
        </div>

        <div className="mt-3 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl [text-wrap:balance]">
              Entrevista de diagnóstico: organización en planta
            </h1>
            <p className="mt-3 text-base leading-relaxed text-slate-600">
              Registre las 15 respuestas de la entrevista operativa para Rapi Tienda D y D. Al
              finalizar, el sistema generará un análisis punto por punto con la problemática
              detectada, la solución según Ronald H. Ballou, la aplicación del Método ABC y la
              bibliografía de respaldo.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onLoadSample}
              disabled={isAnalyzing}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50 whitespace-nowrap shrink-0"
            >
              <FileText className="h-4 w-4 text-slate-500" aria-hidden="true" />
              Cargar ejemplo D y D
            </button>
            <button
              type="button"
              onClick={onResetForm}
              disabled={isAnalyzing || answeredCount === 0}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-transparent px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 whitespace-nowrap shrink-0"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Limpiar
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Progreso del registro
              </span>
              <span className="font-mono text-sm font-semibold text-slate-900 tabular-nums">
                {answeredCount}/{totalCount}
              </span>
            </div>

            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full bg-blue-700 transition-[width] duration-200"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <p className="mt-2 font-mono text-xs text-slate-500 tabular-nums">
              {progressPercent}% completado
            </p>

            <div className="mt-6 border-t border-slate-100 pt-5">
              <span className="block text-xs font-medium uppercase tracking-wider text-slate-500">
                Secciones de la entrevista
              </span>
              <ul className="mt-3 space-y-2">
                {DIAGNOSTIC_SECTIONS.map((section) => {
                  const sectionQuestions = DIAGNOSTIC_QUESTIONS.filter(
                    (q) => q.sectionId === section.id
                  );
                  const doneInSection = sectionQuestions.filter(
                    (q) => (answers[q.id] ?? '').trim().length > 0
                  ).length;

                  return (
                    <li key={section.id}>
                      <a
                        href={`#seccion-${section.id}`}
                        className="group flex items-start justify-between gap-3 rounded-lg px-2.5 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                      >
                        <span className="leading-snug">
                          <span className="font-mono text-xs font-semibold text-slate-400 mr-1.5">
                            {section.roman}.
                          </span>
                          {section.title}
                        </span>
                        <span className="font-mono text-xs text-slate-500 tabular-nums shrink-0 mt-0.5">
                          {doneInSection}/{sectionQuestions.length}
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </aside>

        <form onSubmit={onSubmit} className="space-y-10" noValidate>
          {errorMessage && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900"
            >
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />
              <div>
                <p className="font-semibold">No se pudo completar el análisis</p>
                <p className="mt-1 text-red-800">{errorMessage}</p>
              </div>
            </div>
          )}

          {validationError && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
            >
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
              <div>
                <p className="font-semibold">Faltan respuestas por completar</p>
                <p className="mt-1 text-amber-800">{validationError}</p>
              </div>
            </div>
          )}

          {DIAGNOSTIC_SECTIONS.map((section) => {
            const sectionQuestions = DIAGNOSTIC_QUESTIONS.filter(
              (q) => q.sectionId === section.id
            );

            return (
              <section
                key={section.id}
                id={`seccion-${section.id}`}
                className="scroll-mt-24 rounded-xl border border-slate-200 bg-white"
              >
                <div className="border-b border-slate-200 px-6 py-5">
                  <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500">
                    <span>Sección {section.roman}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">
                      Preguntas {sectionQuestions[0]?.id}–
                      {sectionQuestions[sectionQuestions.length - 1]?.id}
                    </span>
                  </div>
                  <h2 className="mt-1 font-display text-xl font-semibold text-slate-900">
                    {section.title}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">{section.description}</p>
                </div>

                <div className="divide-y divide-slate-100">
                  {sectionQuestions.map((q) => {
                    const value = answers[q.id] ?? '';
                    const isFilled = value.trim().length > 0;
                    const inputId = `pregunta-${q.id}`;

                    return (
                      <div key={q.id} className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <label
                            htmlFor={inputId}
                            className="block text-[15px] font-semibold leading-snug text-slate-900"
                          >
                            <span className="font-mono text-sm font-semibold text-blue-700 mr-2 tabular-nums">
                              {String(q.id).padStart(2, '0')}.
                            </span>
                            {q.question}
                          </label>
                          <span
                            className={`text-xs font-medium shrink-0 ${
                              isFilled ? 'text-emerald-700' : 'text-slate-400'
                            }`}
                          >
                            {isFilled ? 'Respondida' : 'Pendiente'}
                          </span>
                        </div>

                        <p className="mt-1.5 text-xs text-slate-500">{q.helperText}</p>

                        <div className="mt-3">
                          {q.inputType === 'short' ? (
                            <input
                              id={inputId}
                              type="text"
                              value={value}
                              onChange={(e) => onChangeAnswer(q.id, e.target.value)}
                              placeholder={q.placeholder}
                              disabled={isAnalyzing}
                              className="w-full rounded-lg border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-blue-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-700/15 disabled:opacity-60"
                            />
                          ) : (
                            <textarea
                              id={inputId}
                              rows={3}
                              value={value}
                              onChange={(e) => onChangeAnswer(q.id, e.target.value)}
                              placeholder={q.placeholder}
                              disabled={isAnalyzing}
                              className="w-full resize-y rounded-lg border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 text-sm leading-relaxed text-slate-900 placeholder:text-slate-400 transition-colors focus:border-blue-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-700/15 disabled:opacity-60"
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}

          <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Finalizar entrevista y generar diagnóstico
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                Se evaluará cada uno de los 15 puntos por separado identificando su problemática y
                solución según Ronald Ballou.
              </p>
            </div>
            <button
              type="submit"
              disabled={isAnalyzing}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
            >
              {isAnalyzing ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Analizando los 15 puntos...
                </>
              ) : (
                <>
                  Analizar según Ronald Ballou
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
