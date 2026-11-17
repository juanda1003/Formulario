import React, { useEffect, useState } from 'react';
import { Header, type ActiveTab } from './components/Header';
import { DiagnosticForm } from './components/DiagnosticForm';
import { BallouAnalysisReport } from './components/BallouAnalysisReport';
import {
  DIAGNOSTIC_QUESTIONS,
  SAMPLE_ANSWERS_DYD,
  type AnswersMap,
  type BallouAnalysisResult,
} from './data/interviewQuestions';

const STORAGE_ANSWERS_KEY = 'rapi_tienda_dyd_answers_v1';
const STORAGE_REPORT_KEY = 'rapi_tienda_dyd_report_v2';

export default function App() {
  const [answers, setAnswers] = useState<AnswersMap>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ANSWERS_KEY);
      if (saved) return JSON.parse(saved) as AnswersMap;
    } catch {
      // Ignore storage read errors
    }
    return {};
  });

  const [report, setReport] = useState<BallouAnalysisResult | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_REPORT_KEY);
      if (saved) return JSON.parse(saved) as BallouAnalysisResult;
    } catch {
      // Ignore storage read errors
    }
    return null;
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('form');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ANSWERS_KEY, JSON.stringify(answers));
    } catch {
      // Ignore storage write errors
    }
  }, [answers]);

  useEffect(() => {
    try {
      if (report) {
        localStorage.setItem(STORAGE_REPORT_KEY, JSON.stringify(report));
      } else {
        localStorage.removeItem(STORAGE_REPORT_KEY);
      }
    } catch {
      // Ignore storage write errors
    }
  }, [report]);

  const handleChangeAnswer = (id: number, value: string) => {
    setValidationError(null);
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const handleLoadSample = () => {
    setValidationError(null);
    setErrorMessage(null);
    setAnswers(SAMPLE_ANSWERS_DYD);
  };

  const handleResetForm = () => {
    setValidationError(null);
    setErrorMessage(null);
    setAnswers({});
    setReport(null);
  };

  const handleJumpSection = (anchorId: string) => {
    const el = document.getElementById(anchorId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const runAnalysis = async () => {
    const missing = DIAGNOSTIC_QUESTIONS.filter(
      (q) => (answers[q.id] ?? '').trim().length === 0
    );

    if (missing.length > 0) {
      const missingNumbers = missing.map((m) => m.id).join(', ');
      setValidationError(
        `Por favor complete todas las preguntas de la entrevista antes de generar el análisis (faltan las preguntas: ${missingNumbers}). Puede usar "Cargar ejemplo D y D" para probar con datos reales de referencia.`
      );
      const firstMissing = document.getElementById(`pregunta-${missing[0].id}`);
      if (firstMissing) {
        firstMissing.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstMissing.focus();
      }
      return;
    }

    setValidationError(null);
    setErrorMessage(null);
    setIsAnalyzing(true);

    try {
      const payload = {
        items: DIAGNOSTIC_QUESTIONS.map((q) => ({
          id: q.id,
          question: q.question,
          answer: (answers[q.id] ?? '').trim(),
        })),
      };

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.error || 'Ocurrió un error al procesar el análisis en el servidor.'
        );
      }

      setReport(data as BallouAnalysisResult);
      setActiveTab('report');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Error inesperado de comunicación con el servidor.';
      setErrorMessage(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void runAnalysis();
  };

  const handlePrimaryAction = () => {
    if (activeTab === 'report') {
      window.print();
    } else {
      void runAnalysis();
    }
  };

  return (
    <div id="top" className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Header
        activeTab={activeTab}
        hasReport={Boolean(report)}
        isAnalyzing={isAnalyzing}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onJumpSection={handleJumpSection}
        onPrimaryAction={handlePrimaryAction}
      />

      <main className="flex-1">
        {isAnalyzing && activeTab === 'form' && (
          <div className="no-print border-b border-blue-200 bg-blue-50/70">
            <div className="mx-auto flex max-w-[1320px] items-center gap-3 px-6 py-3 text-sm text-blue-900">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-700 shrink-0" />
              <span>
                Evaluando las 15 respuestas bajo el marco logístico de Ronald H. Ballou...
              </span>
            </div>
          </div>
        )}

        {activeTab === 'report' && report ? (
          <BallouAnalysisReport
            report={report}
            onBackToForm={() => {
              setActiveTab('form');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onRegenerate={() => void runAnalysis()}
            isAnalyzing={isAnalyzing}
          />
        ) : (
          <DiagnosticForm
            answers={answers}
            isAnalyzing={isAnalyzing}
            errorMessage={errorMessage}
            validationError={validationError}
            onChangeAnswer={handleChangeAnswer}
            onLoadSample={handleLoadSample}
            onResetForm={handleResetForm}
            onSubmit={handleFormSubmit}
          />
        )}
      </main>

      <footer className="no-print border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-2 px-6 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>Rapi Tienda D y D · Entrevista de diagnóstico: organización en planta</span>
          <span>Referencia teórica: Ronald H. Ballou — Logística: Administración de la cadena de suministro</span>
        </div>
      </footer>
    </div>
  );
}
