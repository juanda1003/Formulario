import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

interface QuestionAnswerPayload {
  id: number;
  question: string;
  answer: string;
}

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'Falta configurar GEMINI_API_KEY en las variables de entorno del servidor (panel Settings > Secrets).'
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  app.post('/api/analyze', async (req: Request, res: Response) => {
    try {
      const body = req.body as { items?: QuestionAnswerPayload[] };
      if (!body || !Array.isArray(body.items) || body.items.length === 0) {
        res.status(400).json({
          error: 'Se requiere la lista de preguntas y respuestas de la entrevista.',
        });
        return;
      }

      const items = body.items;
      const ai = getAiClient();

      const formattedInterview = items
        .map(
          (item) =>
            `Pregunta ${item.id}: ${item.question}\nRespuesta registrada: ${
              item.answer?.trim() ? item.answer.trim() : 'Sin respuesta detallada proporcionada.'
            }`
        )
        .join('\n\n');

      const systemInstruction = `Eres un consultor senior en ingeniería logística y administración de la cadena de suministro, especialista en la obra "Logística: Administración de la cadena de suministro" (5a edición) de Ronald H. Ballou.

Tu tarea es analizar una entrevista de diagnóstico de organización en planta realizada a "Rapi Tienda D y D" (una tienda de conveniencia / minimercado de barrio con bodega pequeña) integrando rigurosamente el MÉTODO ABC (Curva 80-20 de Pareto y criterio de popularidad de Ballou) junto con los principios logísticos de Ronald H. Ballou, entregando un análisis separado para cada uno de los 15 puntos del formulario.

Reglas estrictas del análisis:
1. Analiza TODOS los 15 puntos en orden exacto (del 1 al 15), sin omitir ninguno ni fusionar preguntas.
2. Para cada punto debes identificar:
   - "conceptoBallou": El concepto, principio o capítulo específico de Ronald H. Ballou aplicable a esa pregunta (por ejemplo: Cap. 2 Triángulo de decisiones logísticas; Cap. 9 Clasificación ABC de inventarios y políticas de control; Cap. 11 Sistema de almacenamiento y manejo; Cap. 12 Criterios de ubicación por popularidad, tamaño, complementariedad y compatibilidad, utilización del espacio cúbico; Cap. 16 Organización logística).
   - "problematica": La problemática logística, operativa, administrativa o de seguridad identificada a partir de la respuesta del punto. Si la respuesta es informativa (ej. actividad económica, dueño, representante legal, tiempo), señala la brecha de formalización logística u organizacional asociada.
   - "solucionBallou": Una solución concreta, realista y accionable para Rapi Tienda D y D fundamentada en lo que propone Ronald H. Ballou.
   - "aplicacionMetodoABC": Cómo se aplica específicamente el Método ABC (Clasificación A: alta rotación ~80% del volumen/ventas con ~20% de referencias; B: rotación media; C: baja rotación o lento movimiento) a ese punto concreto (ej. asignación de cargos de conteo cíclico A-B-C, ubicación de productos A cerca de salida/nivel ergonómico, separación de químicos A/B/C de alimentos, recepción prioritaria de clase A, almacenamiento externo reservado solo para exceso de clase C o estacional, etc.).
   - "prioridad": Clasificación estricta como "Alta", "Media" o "Baja".
3. Construye "matrizMetodoABC" con exactamente 3 objetos (Clase "A", Clase "B" y Clase "C") adaptados a los productos mencionados en la entrevista de Rapi Tienda D y D, detallando cómo ubicarlos en bodega y cómo gestionar su inventario según Ballou.
4. Incluye el resumen ejecutivo, el Triángulo Logístico de Ballou, 4 acciones inmediatas y la sección "bibliografia" citando de manera exacta y verificable las fuentes reales de Ronald H. Ballou en formato APA 7.ª edición (edición en español e inglés de "Logística: Administración de la cadena de suministro", 5.ª ed., Pearson Educación, 2004, y sus capítulos específicos empleados: Cap. 2, Cap. 9, Cap. 11, Cap. 12 y Cap. 16).`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Analiza la siguiente entrevista de diagnóstico de organización en planta de Rapi Tienda D y D usando el Método ABC y los principios de Ronald H. Ballou:\n\n${formattedInterview}`,
        config: {
          systemInstruction,
          thinkingConfig: { thinkingLevel: ThinkingLevel.MEDIUM },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              empresa: {
                type: Type.STRING,
                description: 'Nombre de la empresa analizada (Rapi Tienda D y D).',
              },
              resumenEjecutivo: {
                type: Type.STRING,
                description:
                  'Síntesis ejecutiva del estado logístico actual de la planta y bodega de Rapi Tienda D y D integrando Ballou y el Método ABC.',
              },
              trianguloBallou: {
                type: Type.OBJECT,
                properties: {
                  almacenamientoYManejo: {
                    type: Type.STRING,
                    description:
                      'Diagnóstico sobre almacenamiento, diseño de planta, cubicación y manejo de materiales según Ballou.',
                  },
                  gestionInventarios: {
                    type: Type.STRING,
                    description:
                      'Diagnóstico sobre clasificación ABC, rotación PEPS, frecuencia de pedido y punto de reorden según Ballou.',
                  },
                  organizacionYServicio: {
                    type: Type.STRING,
                    description:
                      'Diagnóstico sobre estructura de roles, coordinación con proveedores y servicio al cliente según Ballou.',
                  },
                },
                required: [
                  'almacenamientoYManejo',
                  'gestionInventarios',
                  'organizacionYServicio',
                ],
              },
              matrizMetodoABC: {
                type: Type.ARRAY,
                description: 'Clasificación ABC de productos para Rapi Tienda D y D (exactamente 3 elementos: A, B, C).',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    clase: {
                      type: Type.STRING,
                      description: 'Letra de la categoría: A, B o C.',
                    },
                    nombre: {
                      type: Type.STRING,
                      description: 'Nombre descriptivo de la categoría (ej. Alta rotación / Artículos críticos).',
                    },
                    participacionRotacion: {
                      type: Type.STRING,
                      description: 'Porcentaje aproximado de referencias vs. volumen de salida/ingresos (ej. ~20% SKU / ~80% rotación).',
                    },
                    productosTipicos: {
                      type: Type.STRING,
                      description: 'Productos típicos de Rapi Tienda D y D en esta categoría.',
                    },
                    ubicacionPlantaBodega: {
                      type: Type.STRING,
                      description: 'Regla de ubicación física en bodega y punto de venta según popularidad de Ballou.',
                    },
                    politicaControlYReposicion: {
                      type: Type.STRING,
                      description: 'Frecuencia de conteo, inventario de seguridad y política de reabastecimiento.',
                    },
                  },
                  required: [
                    'clase',
                    'nombre',
                    'participacionRotacion',
                    'productosTipicos',
                    'ubicacionPlantaBodega',
                    'politicaControlYReposicion',
                  ],
                },
              },
              planAccionInmediato: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Lista de 4 acciones concretas e inmediatas recomendadas integrando Método ABC y Ballou.',
              },
              puntos: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    numero: {
                      type: Type.INTEGER,
                      description: 'Número de la pregunta (1 a 15).',
                    },
                    pregunta: {
                      type: Type.STRING,
                      description: 'Texto exacto de la pregunta.',
                    },
                    respuestaResumen: {
                      type: Type.STRING,
                      description: 'Síntesis fiel de la respuesta ingresada en el formulario.',
                    },
                    conceptoBallou: {
                      type: Type.STRING,
                      description: 'Principio y capítulo específico de Ronald H. Ballou aplicable.',
                    },
                    problematica: {
                      type: Type.STRING,
                      description: 'Problemática específica identificada en este punto.',
                    },
                    solucionBallou: {
                      type: Type.STRING,
                      description: 'Solución práctica recomendada según Ronald H. Ballou.',
                    },
                    aplicacionMetodoABC: {
                      type: Type.STRING,
                      description: 'Aplicación específica del Método ABC (A, B, C) para resolver o estructurar este punto.',
                    },
                    prioridad: {
                      type: Type.STRING,
                      description: 'Nivel de prioridad: Alta, Media o Baja.',
                    },
                  },
                  required: [
                    'numero',
                    'pregunta',
                    'respuestaResumen',
                    'conceptoBallou',
                    'problematica',
                    'solucionBallou',
                    'aplicacionMetodoABC',
                    'prioridad',
                  ],
                },
              },
              bibliografia: {
                type: Type.ARRAY,
                description: 'Referencias bibliográficas reales y exactas de Ronald H. Ballou utilizadas en el diagnóstico.',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    citaAPA: {
                      type: Type.STRING,
                      description: 'Referencia completa en formato APA 7.ª edición.',
                    },
                    capitulosAplicados: {
                      type: Type.STRING,
                      description: 'Capítulos y secciones específicas del libro aplicadas al diagnóstico.',
                    },
                    aporteAlAnalisis: {
                      type: Type.STRING,
                      description: 'Qué fundamentos del análisis se extraen de esta fuente.',
                    },
                  },
                  required: ['citaAPA', 'capitulosAplicados', 'aporteAlAnalisis'],
                },
              },
            },
            required: [
              'empresa',
              'resumenEjecutivo',
              'trianguloBallou',
              'matrizMetodoABC',
              'planAccionInmediato',
              'puntos',
              'bibliografia',
            ],
          },
        },
      });

      const rawText = response.text;
      if (!rawText) {
        res.status(502).json({
          error: 'El servicio de análisis devolvió una respuesta vacía. Intenta nuevamente.',
        });
        return;
      }

      const parsed = JSON.parse(rawText);

      // Normalize prioridad to guarantee strict union values
      const normalizedPoints = Array.isArray(parsed.puntos)
        ? parsed.puntos.map((p: Record<string, unknown>, idx: number) => {
            const rawPrio = String(p.prioridad ?? 'Media').toLowerCase();
            let prioridad: 'Alta' | 'Media' | 'Baja' = 'Media';
            if (rawPrio.includes('alt')) prioridad = 'Alta';
            else if (rawPrio.includes('baj')) prioridad = 'Baja';

            const sourceItem = items.find((i) => i.id === Number(p.numero)) ?? items[idx];

            return {
              numero: Number(p.numero) || sourceItem?.id || idx + 1,
              pregunta: sourceItem?.question || String(p.pregunta ?? ''),
              respuestaResumen: String(p.respuestaResumen ?? sourceItem?.answer ?? ''),
              conceptoBallou: String(p.conceptoBallou ?? ''),
              problematica: String(p.problematica ?? ''),
              solucionBallou: String(p.solucionBallou ?? ''),
              aplicacionMetodoABC: String(p.aplicacionMetodoABC ?? ''),
              prioridad,
            };
          })
        : [];

      const normalizedABC = Array.isArray(parsed.matrizMetodoABC)
        ? parsed.matrizMetodoABC.map((item: Record<string, unknown>, idx: number) => {
            const rawClass = String(item.clase ?? '').toUpperCase();
            const clase: 'A' | 'B' | 'C' = rawClass.includes('A')
              ? 'A'
              : rawClass.includes('B')
                ? 'B'
                : rawClass.includes('C')
                  ? 'C'
                  : idx === 0
                    ? 'A'
                    : idx === 1
                      ? 'B'
                      : 'C';
            return {
              clase,
              nombre: String(item.nombre ?? ''),
              participacionRotacion: String(item.participacionRotacion ?? ''),
              productosTipicos: String(item.productosTipicos ?? ''),
              ubicacionPlantaBodega: String(item.ubicacionPlantaBodega ?? ''),
              politicaControlYReposicion: String(item.politicaControlYReposicion ?? ''),
            };
          })
        : [];

      const defaultBibliography = [
        {
          citaAPA:
            'Ballou, R. H. (2004). Logística: Administración de la cadena de suministro (5.ª ed., C. Mendoza Barraza, Trad.). Pearson Educación / Prentice Hall. (ISBN 970-26-0540-7).',
          capitulosAplicados:
            'Cap. 2 (Estrategia y planeación logística), Cap. 9 (Decisiones sobre políticas de inventario: clasificación ABC), Cap. 11 (Sistema de almacenamiento y manejo), Cap. 12 (Decisiones sobre almacenamiento y manejo) y Cap. 16 (Organización de la logística).',
          aporteAlAnalisis:
            'Fuente principal para el Triángulo de Toma de Decisiones Logísticas, la aplicación del Método ABC por popularidad y rotación, los criterios de ubicación en bodega (popularidad, tamaño, complementariedad y compatibilidad), el aprovechamiento del espacio cúbico y la gestión de inventarios.',
        },
        {
          citaAPA:
            'Ballou, R. H. (2004). Business Logistics / Supply Chain Management: Planning, Organizing, and Controlling the Supply Chain (5th ed.). Pearson Prentice Hall. (ISBN 0-13-066184-8).',
          capitulosAplicados:
            'Chapter 9 (Inventory Policy Decisions: ABC Inventory Classification) y Chapter 12 (Storage and Handling Decisions: Stock Location & Layout).',
          aporteAlAnalisis:
            'Referencia original en inglés que fundamenta la terminología técnica de clasificación ABC de Pareto, modelos de reabastecimiento (EOQ / punto de reorden), diseño de layout de almacenes y reducción de costos de manejo de materiales.',
        },
      ];

      const normalizedBibliography =
        Array.isArray(parsed.bibliografia) && parsed.bibliografia.length > 0
          ? parsed.bibliografia.map((b: Record<string, unknown>) => ({
              citaAPA: String(b.citaAPA ?? ''),
              capitulosAplicados: String(b.capitulosAplicados ?? ''),
              aporteAlAnalisis: String(b.aporteAlAnalisis ?? ''),
            }))
          : defaultBibliography;

      res.json({
        empresa: String(parsed.empresa || 'Rapi Tienda D y D'),
        fechaAnalisis: new Date().toLocaleDateString('es-CO', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        resumenEjecutivo: String(parsed.resumenEjecutivo ?? ''),
        trianguloBallou: {
          almacenamientoYManejo: String(parsed.trianguloBallou?.almacenamientoYManejo ?? ''),
          gestionInventarios: String(parsed.trianguloBallou?.gestionInventarios ?? ''),
          organizacionYServicio: String(parsed.trianguloBallou?.organizacionYServicio ?? ''),
        },
        matrizMetodoABC: normalizedABC,
        planAccionInmediato: Array.isArray(parsed.planAccionInmediato)
          ? parsed.planAccionInmediato.map((a: unknown) => String(a))
          : [],
        puntos: normalizedPoints,
        bibliografia: normalizedBibliography,
      });
    } catch (error: unknown) {
      const errObj = error as { status?: number; message?: string };
      console.error('Error en /api/analyze:', errObj);

      const message = errObj?.message || 'Error al generar el análisis según Ronald Ballou.';
      const status =
        typeof errObj?.status === 'number' && errObj.status >= 400 && errObj.status < 600
          ? errObj.status
          : 500;

      if (message.includes('API_KEY_INVALID') || message.includes('PERMISSION_DENIED')) {
        res.status(403).json({
          error:
            'La clave GEMINI_API_KEY no es válida o no tiene permisos. Verifícala en Settings > Secrets.',
        });
        return;
      }
      if (message.includes('RESOURCE_EXHAUSTED')) {
        res.status(429).json({
          error:
            'Se alcanzó el límite de solicitudes de la API. Espera unos segundos e intenta de nuevo.',
        });
        return;
      }

      res.status(status).json({ error: message });
    }
  });

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('/{*splat}', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor ejecutándose en http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Error fatal al iniciar el servidor:', err);
  process.exit(1);
});
