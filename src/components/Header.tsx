import React from 'react';

export type ActiveTab = 'form' | 'report';

interface HeaderProps {
  activeTab: ActiveTab;
  hasReport: boolean;
  isAnalyzing: boolean;
  onNavigateTab: (tab: ActiveTab) => void;
  onJumpSection: (anchorId: string) => void;
  onPrimaryAction: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  hasReport,
  isAnalyzing,
  onNavigateTab,
  onJumpSection,
  onPrimaryAction,
}) => {
  return (
    <header className="no-print sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-8 px-6 py-4">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            onNavigateTab('form');
          }}
          className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
        >
          Rapi Tienda D y D
        </a>

        <nav
          aria-label="Navegación principal"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600"
        >
          <button
            type="button"
            onClick={() => onNavigateTab('form')}
            className={`cursor-pointer py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeTab === 'form'
                ? 'border-blue-700 text-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            Entrevista
          </button>

          <button
            type="button"
            onClick={() => {
              if (hasReport) {
                onNavigateTab('report');
              } else {
                onJumpSection('seccion-distribucion');
              }
            }}
            className={`cursor-pointer py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeTab === 'report'
                ? 'border-blue-700 text-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            {hasReport ? 'Análisis Ballou' : 'Distribución'}
          </button>

          <button
            type="button"
            onClick={() => {
              if (hasReport) {
                onNavigateTab('report');
                setTimeout(() => onJumpSection('metodo-abc'), 50);
              } else {
                onJumpSection('seccion-espacio-flujo');
              }
            }}
            className="cursor-pointer py-1 border-b-2 border-transparent hover:text-slate-900 hover:border-slate-300 transition-colors whitespace-nowrap shrink-0"
          >
            {hasReport ? 'Método ABC' : 'Espacio y Flujo'}
          </button>

          <button
            type="button"
            onClick={() => {
              if (hasReport) {
                onNavigateTab('report');
                setTimeout(() => onJumpSection('bibliografia'), 50);
              } else {
                onJumpSection('seccion-recepcion-mejora');
              }
            }}
            className="cursor-pointer py-1 border-b-2 border-transparent hover:text-slate-900 hover:border-slate-300 transition-colors whitespace-nowrap shrink-0"
          >
            {hasReport ? 'Bibliografía' : 'Recepción'}
          </button>
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            disabled={isAnalyzing}
            onClick={onPrimaryAction}
            className="cursor-pointer rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
          >
            {isAnalyzing
              ? 'Analizando...'
              : activeTab === 'report'
                ? 'Imprimir informe'
                : 'Generar análisis Ballou'}
          </button>
        </div>
      </div>
    </header>
  );
};
