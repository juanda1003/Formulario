import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Copy,
  Download,
  Info,
  Printer,
  Search,
} from 'lucide-react';
import type { BallouAnalysisResult, BallouPointAnalysis } from '../data/interviewQuestions';

interface BallouAnalysisReportProps {
  report: BallouAnalysisResult;
  onBackToForm: () => void;
  onRegenerate: () => void;
  isAnalyzing: boolean;
}

type PriorityFilter = 'Todas' | 'Alta' | 'Media' | 'Baja';

function getPriorityDisplay(priority: BallouPointAnalysis['prioridad']) {
  if (priority === 'Alta') {
    return {
      label: 'Prioridad Alta',
      textClass: 'text-red-700',
      icon: <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" aria-hidden="true" />,
    };
  }
  if (priority === 'Media') {
    return {
      label: 'Prioridad Media',
      textClass: 'text-amber-700',
      icon: <Info className="h-4 w-4 text-amber-600 shrink-0" aria-hidden="true" />,
    };
  }
  return {
    label: 'Prioridad Baja',
    textClass: 'text-emerald-700',
    icon: <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" aria-hidden="true" />,
  };
}

function buildMarkdownReport(report: BallouAnalysisResult): string {
  const lines: string[] = [
    `# Diagnóstico de Organización en Planta — ${report.empresa}`,
    `Fecha: ${report.fechaAnalisis}`,
    `Marco teórico: Ronald H. Ballou y Método ABC (Pareto 80-20)`,
    '',
    '## Resumen Ejecutivo',
    report.resumenEjecutivo,
    '',
    '## Evaluación bajo el Triángulo Logístico de Ronald Ballou',
    `- **Almacenamiento y Manejo de Materiales:** ${report.trianguloBallou.almacenamientoYManejo}`,
    `- **Gestión de Inventarios:** ${report.trianguloBallou.gestionInventarios}`,
    `- **Organización y Servicio al Cliente:** ${report.trianguloBallou.organizacionYServicio}`,
    '',
    '## Matriz del Método ABC aplicada a Rapi Tienda D y D',
    ...report.matrizMetodoABC.flatMap((c) => [
      `### Clase ${c.clase} — ${c.nombre} (${c.participacionRotacion})`,
      `- **Productos típicos:** ${c.productosTipicos}`,
      `- **Ubicación en planta/bodega (Popularidad de Ballou):** ${c.ubicacionPlantaBodega}`,
      `- **Política de control y reposición:** ${c.politicaControlYReposicion}`,
      '',
    ]),
    '## Plan de Acción Inmediato',
    ...report.planAccionInmediato.map((item, idx) => `${idx + 1}. ${item}`),
    '',
    '## Análisis Punto por Punto (Preguntas 1 a 15)',
    '',
  ];

  for (const p of report.puntos) {
    lines.push(`### ${p.numero}. ${p.pregunta}`);
    lines.push(`- **Prioridad:** ${p.prioridad}`);
    lines.push(`- **Respuesta registrada:** ${p.respuestaResumen}`);
    lines.push(`- **Principio de Ronald Ballou:** ${p.conceptoBallou}`);
    lines.push(`- **Problemática identificada:** ${p.problematica}`);
    lines.push(`- **Solución según Ronald Ballou:** ${p.solucionBallou}`);
    lines.push(`- **Aplicación del Método ABC:** ${p.aplicacionMetodoABC}`);
    lines.push('');
  }

  lines.push('## Bibliografía');
  lines.push('');
  for (const ref of report.bibliografia) {
    lines.push(`- ${ref.citaAPA}`);
    lines.push(`  - *Capítulos aplicados:* ${ref.capitulosAplicados}`);
    lines.push(`  - *Aporte al diagnóstico:* ${ref.aporteAlAnalisis}`);
  }

  return lines.join('\n');
}

export const BallouAnalysisReport: React.FC<BallouAnalysisReportProps> = ({
  report,
  onBackToForm,
  onRegenerate,
  isAnalyzing,
}) => {
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('Todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  const matrizABC = report.matrizMetodoABC ?? [];
  const bibliografia = report.bibliografia ?? [];

  const counts = useMemo(() => {
    const high = report.puntos.filter((p) => p.prioridad === 'Alta').length;
    const medium = report.puntos.filter((p) => p.prioridad === 'Media').length;
    const low = report.puntos.filter((p) => p.prioridad === 'Baja').length;
    return { high, medium, low, total: report.puntos.length };
  }, [report.puntos]);

  const filteredPoints = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return report.puntos.filter((p) => {
      const matchesPriority = priorityFilter === 'Todas' || p.prioridad === priorityFilter;
      if (!matchesPriority) return false;
      if (!q) return true;
      return (
        String(p.numero).includes(q) ||
        p.pregunta.toLowerCase().includes(q) ||
        p.conceptoBallou.toLowerCase().includes(q) ||
        p.problematica.toLowerCase().includes(q) ||
        p.solucionBallou.toLowerCase().includes(q) ||
        (p.aplicacionMetodoABC ?? '').toLowerCase().includes(q)
      );
    });
  }, [report.puntos, priorityFilter, searchQuery]);

  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(buildMarkdownReport(report));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  const handleDownloadMarkdown = () => {
    const content = buildMarkdownReport(report);
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'diagnostico-rapi-tienda-dyd-ballou-abc.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-[1320px] px-6 py-10">
      <div className="mb-10 border-b border-slate-200 pb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
            <span>Informe Técnico Logístico</span>
            <span aria-hidden="true">·</span>
            <span>{report.empresa}</span>
            <span aria-hidden="true">·</span>
            <span>Método ABC y Ronald H. Ballou</span>
            <span aria-hidden="true">·</span>
            <span>{report.fechaAnalisis}</span>
          </div>

          <div className="no-print flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onBackToForm}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 whitespace-nowrap shrink-0"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              Editar respuestas
            </button>
            <button
              type="button"
              onClick={onRegenerate}
              disabled={isAnalyzing}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-50 whitespace-nowrap shrink-0"
            >
              Regenerar análisis
            </button>
            <button
              type="button"
              onClick={handleCopyMarkdown}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 whitespace-nowrap shrink-0"
            >
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              {copied ? 'Copiado' : 'Copiar texto'}
            </button>
            <button
              type="button"
              onClick={handleDownloadMarkdown}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 whitespace-nowrap shrink-0"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              Descargar .MD
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-slate-800 whitespace-nowrap shrink-0"
            >
              <Printer className="h-3.5 w-3.5" aria-hidden="true" />
              Imprimir / PDF
            </button>
          </div>
        </div>

        <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl [text-wrap:balance]">
          Análisis con Método ABC y Ronald H. Ballou
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-600">
          {report.resumenEjecutivo}
        </p>

        <div className="mt-8 grid grid-cols-2 gap-6 border-t border-slate-200 pt-6 sm:grid-cols-4">
          <div>
            <span className="text-xs font-medium text-slate-500">Puntos evaluados</span>
            <p className="mt-1 font-mono text-2xl font-semibold text-slate-900 tabular-nums">
              {counts.total}
            </p>
          </div>
          <div>
            <span className="text-xs font-medium text-red-700">Prioridad Alta</span>
            <p className="mt-1 font-mono text-2xl font-semibold text-slate-900 tabular-nums">
              {counts.high}
            </p>
          </div>
          <div>
            <span className="text-xs font-medium text-amber-700">Prioridad Media</span>
            <p className="mt-1 font-mono text-2xl font-semibold text-slate-900 tabular-nums">
              {counts.medium}
            </p>
          </div>
          <div>
            <span className="text-xs font-medium text-emerald-700">Prioridad Baja</span>
            <p className="mt-1 font-mono text-2xl font-semibold text-slate-900 tabular-nums">
              {counts.low}
            </p>
          </div>
        </div>
      </div>

      <section
        id="triangulo-ballou"
        className="mb-10 scroll-mt-24 rounded-xl border border-slate-200 bg-white p-6"
      >
        <div className="border-b border-slate-100 pb-4">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Marco estratégico de Ronald H. Ballou
          </span>
          <h2 className="mt-1 font-display text-xl font-semibold text-slate-900">
            Triángulo de la toma de decisiones logísticas
          </h2>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-8 md:grid-cols-3 md:divide-x md:divide-slate-100">
          <div className="md:pr-4">
            <h3 className="text-sm font-semibold text-slate-900">
              01. Almacenamiento y manejo de materiales
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {report.trianguloBallou.almacenamientoYManejo}
            </p>
          </div>

          <div className="md:px-6">
            <h3 className="text-sm font-semibold text-slate-900">02. Gestión de inventarios</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {report.trianguloBallou.gestionInventarios}
            </p>
          </div>

          <div className="md:pl-6">
            <h3 className="text-sm font-semibold text-slate-900">
              03. Organización y servicio al cliente
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {report.trianguloBallou.organizacionYServicio}
            </p>
          </div>
        </div>
      </section>

      {matrizABC.length > 0 && (
        <section
          id="metodo-abc"
          className="mb-10 scroll-mt-24 rounded-xl border border-slate-200 bg-white overflow-hidden"
        >
          <div className="border-b border-slate-200 px-6 py-5">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Clasificación de inventarios y criterio de popularidad (Ballou, Cap. 9 y Cap. 12)
            </span>
            <h2 className="mt-1 font-display text-xl font-semibold text-slate-900">
              Matriz del Método ABC aplicada a Rapi Tienda D y D
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Segmentación por curva 80-20 (Pareto) para asignar ubicaciones privilegiadas en
              bodega y definir frecuencias diferenciadas de control y pedido.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-3.5">Clase</th>
                  <th className="px-6 py-3.5">Participación (Pareto)</th>
                  <th className="px-6 py-3.5">Productos en D y D</th>
                  <th className="px-6 py-3.5">Ubicación en planta y bodega</th>
                  <th className="px-6 py-3.5">Control y reposición</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {matrizABC.map((row) => (
                  <tr key={row.clase} className="align-top transition-colors hover:bg-slate-50/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-base font-bold text-blue-700 tabular-nums">
                        Clase {row.clase}
                      </span>
                      <p className="mt-0.5 text-xs font-medium text-slate-600">{row.nombre}</p>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs font-medium text-slate-800 tabular-nums">
                      {row.participacionRotacion}
                    </td>
                    <td className="px-6 py-4 text-slate-700 leading-relaxed">
                      {row.productosTipicos}
                    </td>
                    <td className="px-6 py-4 text-slate-700 leading-relaxed">
                      {row.ubicacionPlantaBodega}
                    </td>
                    <td className="px-6 py-4 text-slate-700 leading-relaxed">
                      {row.politicaControlYReposicion}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section
        id="plan-accion"
        className="mb-10 scroll-mt-24 rounded-xl border border-slate-200 bg-white p-6"
      >
        <div className="border-b border-slate-100 pb-4">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Hoja de ruta operativa
          </span>
          <h2 className="mt-1 font-display text-xl font-semibold text-slate-900">
            Plan de acción inmediato para Rapi Tienda D y D
          </h2>
        </div>
        <ol className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {report.planAccionInmediato.map((accion, index) => (
            <li
              key={index}
              className="flex items-start gap-3 border-b border-slate-100 pb-4 last:border-b-0 md:border-b-0"
            >
              <span className="font-mono text-sm font-semibold text-blue-700 tabular-nums shrink-0 mt-0.5">
                {String(index + 1).padStart(2, '0')}.
              </span>
              <p className="text-sm leading-relaxed text-slate-700">{accion}</p>
            </li>
          ))}
        </ol>
      </section>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="no-print lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <span className="block text-xs font-medium uppercase tracking-wider text-slate-500">
              Índice de los 15 puntos
            </span>
            <ul className="mt-3 space-y-1">
              {report.puntos.map((p) => {
                const prioColor =
                  p.prioridad === 'Alta'
                    ? 'text-red-700'
                    : p.prioridad === 'Media'
                      ? 'text-amber-700'
                      : 'text-emerald-700';

                return (
                  <li key={p.numero}>
                    <a
                      href={`#analisis-punto-${p.numero}`}
                      className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-xs text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                    >
                      <span className="truncate">
                        <span className="font-mono font-semibold text-slate-400 mr-1.5 tabular-nums">
                          {String(p.numero).padStart(2, '0')}
                        </span>
                        {p.pregunta}
                      </span>
                      <span className={`font-medium shrink-0 ${prioColor}`}>{p.prioridad}</span>
                    </a>
                  </li>
                );
              })}
            </ul>

            <div className="mt-4 border-t border-slate-100 pt-3">
              <a
                href="#bibliografia"
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-50"
              >
                <BookOpen className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                Ir a Bibliografía
              </a>
            </div>
          </div>
        </aside>

        <div>
          <div className="no-print mb-6 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1">
              {(['Todas', 'Alta', 'Media', 'Baja'] as PriorityFilter[]).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setPriorityFilter(filter)}
                  className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    priorityFilter === filter
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {filter === 'Todas' ? `Todas (${counts.total})` : `Prioridad ${filter}`}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar punto o concepto..."
                aria-label="Buscar en el análisis"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-700 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {filteredPoints.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
              <p className="text-sm font-medium text-slate-900">
                No hay puntos que coincidan con el filtro actual.
              </p>
              <button
                type="button"
                onClick={() => {
                  setPriorityFilter('Todas');
                  setSearchQuery('');
                }}
                className="mt-3 cursor-pointer text-sm font-medium text-blue-700 hover:underline"
              >
                Restablecer filtros
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredPoints.map((punto) => {
                const priorityMeta = getPriorityDisplay(punto.prioridad);

                return (
                  <article
                    key={punto.numero}
                    id={`analisis-punto-${punto.numero}`}
                    className="print-break-inside-avoid scroll-mt-24 rounded-xl border border-slate-200 bg-white p-6"
                  >
                    <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span className="font-mono font-semibold text-blue-700 tabular-nums">
                            Punto {String(punto.numero).padStart(2, '0')}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{punto.conceptoBallou}</span>
                        </div>
                        <h3 className="mt-1.5 font-display text-lg font-semibold leading-snug text-slate-900">
                          {punto.pregunta}
                        </h3>
                      </div>

                      <div className="inline-flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap shrink-0">
                        {priorityMeta.icon}
                        <span className={priorityMeta.textClass}>{priorityMeta.label}</span>
                      </div>
                    </div>

                    <div className="mt-4 border-b border-slate-100 pb-4">
                      <span className="block text-xs font-medium uppercase tracking-wider text-slate-500">
                        Respuesta registrada en entrevista
                      </span>
                      <p className="mt-1.5 text-sm leading-relaxed text-slate-700">
                        {punto.respuestaResumen}
                      </p>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div>
                        <span className="block text-xs font-semibold uppercase tracking-wider text-red-700">
                          Problemática identificada
                        </span>
                        <p className="mt-2 text-sm leading-relaxed text-slate-700">
                          {punto.problematica}
                        </p>
                      </div>

                      <div>
                        <span className="block text-xs font-semibold uppercase tracking-wider text-blue-700">
                          Solución según Ronald Ballou
                        </span>
                        <p className="mt-2 text-sm leading-relaxed text-slate-700">
                          {punto.solucionBallou}
                        </p>
                      </div>
                    </div>

                    {punto.aplicacionMetodoABC && (
                      <div className="mt-4 border-t border-slate-100 pt-4">
                        <span className="block text-xs font-semibold uppercase tracking-wider text-slate-800">
                          Aplicación del Método ABC en este punto
                        </span>
                        <p className="mt-1.5 text-sm leading-relaxed text-slate-700">
                          {punto.aplicacionMetodoABC}
                        </p>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}

          {bibliografia.length > 0 && (
            <section
              id="bibliografia"
              className="print-break-inside-avoid mt-10 scroll-mt-24 rounded-xl border border-slate-200 bg-white p-6"
            >
              <div className="border-b border-slate-100 pb-4">
                <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  Fuentes académicas y técnicas (APA 7.ª ed.)
                </span>
                <h2 className="mt-1 font-display text-xl font-semibold text-slate-900">
                  Bibliografía del análisis
                </h2>
              </div>

              <ol className="mt-5 divide-y divide-slate-100">
                {bibliografia.map((ref, idx) => (
                  <li key={idx} className="py-4 first:pt-0 last:pb-0">
                    <p className="text-sm font-medium leading-relaxed text-slate-900">
                      <span className="font-mono text-xs font-semibold text-slate-400 mr-2 tabular-nums">
                        [{idx + 1}]
                      </span>
                      {ref.citaAPA}
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                      <strong className="font-semibold text-slate-700">
                        Capítulos aplicados:{' '}
                      </strong>
                      {ref.capitulosAplicados}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">
                      <strong className="font-semibold text-slate-700">
                        Aporte al diagnóstico:{' '}
                      </strong>
                      {ref.aporteAlAnalisis}
                    </p>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
