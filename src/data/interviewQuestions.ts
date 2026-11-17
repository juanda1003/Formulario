export interface DiagnosticQuestion {
  id: number;
  sectionId: string;
  question: string;
  inputType: 'short' | 'long';
  placeholder: string;
  helperText: string;
}

export interface DiagnosticSection {
  id: string;
  roman: string;
  title: string;
  description: string;
}

export type AnswersMap = Record<number, string>;

export interface BallouPointAnalysis {
  numero: number;
  pregunta: string;
  respuestaResumen: string;
  conceptoBallou: string;
  problematica: string;
  solucionBallou: string;
  aplicacionMetodoABC: string;
  prioridad: 'Alta' | 'Media' | 'Baja';
}

export interface BallouTriangleSummary {
  almacenamientoYManejo: string;
  gestionInventarios: string;
  organizacionYServicio: string;
}

export interface AbcCategoryDetail {
  clase: 'A' | 'B' | 'C';
  nombre: string;
  participacionRotacion: string;
  productosTipicos: string;
  ubicacionPlantaBodega: string;
  politicaControlYReposicion: string;
}

export interface BibliographicSource {
  citaAPA: string;
  capitulosAplicados: string;
  aporteAlAnalisis: string;
}

export interface BallouAnalysisResult {
  empresa: string;
  fechaAnalisis: string;
  resumenEjecutivo: string;
  trianguloBallou: BallouTriangleSummary;
  matrizMetodoABC: AbcCategoryDetail[];
  planAccionInmediato: string[];
  puntos: BallouPointAnalysis[];
  bibliografia: BibliographicSource[];
}

export const DIAGNOSTIC_SECTIONS: DiagnosticSection[] = [
  {
    id: 'identificacion',
    roman: 'I',
    title: 'Identificación y estructura organizacional',
    description:
      'Perfil general, trayectoria comercial y definición de roles operativos dentro de la rapi tienda D y D.',
  },
  {
    id: 'distribucion',
    roman: 'II',
    title: 'Distribución de planta y zonificación de bodega',
    description:
      'Configuración física de las áreas de venta, almacenamiento y criterios de asignación de ubicaciones.',
  },
  {
    id: 'espacio-flujo',
    roman: 'III',
    title: 'Restricciones de espacio, segregación y flujo',
    description:
      'Cuellos de botella por capacidad reducida, compatibilidad entre líneas y dificultades en la preparación de pedidos.',
  },
  {
    id: 'recepcion-mejora',
    roman: 'IV',
    title: 'Recepción, mejora continua y capacidad externa',
    description:
      'Procedimientos de ingreso de mercancía de proveedores, oportunidades de rediseño y almacenamiento auxiliar.',
  },
];

export const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  {
    id: 1,
    sectionId: 'identificacion',
    question: '¿Cuál es la actividad económica principal de la empresa?',
    inputType: 'short',
    placeholder: 'Ej. Comercio al por menor de víveres, abarrotes, bebidas y productos de aseo (Rapi Tienda).',
    helperText: 'Especifique el objeto comercial principal y las líneas de productos que comercializa.',
  },
  {
    id: 2,
    sectionId: 'identificacion',
    question: '¿Cuál es el nombre del dueño de la rapi tienda?',
    inputType: 'short',
    placeholder: 'Ej. Nombre completo del propietario o socio principal.',
    helperText: 'Persona propietaria responsable del establecimiento.',
  },
  {
    id: 3,
    sectionId: 'identificacion',
    question: '¿Quién es el representante legal y cuáles son sus datos de contacto?',
    inputType: 'long',
    placeholder: 'Ej. Nombre completo, teléfono/celular, correo electrónico y dirección comercial.',
    helperText: 'Incluya teléfono y correo para registro administrativo del diagnóstico.',
  },
  {
    id: 4,
    sectionId: 'identificacion',
    question: '¿Cuáles son los cargos que existen dentro de la empresa y qué funciones cumple cada persona?',
    inputType: 'long',
    placeholder: 'Ej. Administrador (compras y caja), Auxiliar de tienda (atención y surtido), Bodeguero/Repartidor...',
    helperText: 'Detalle cada rol y si existe personal dedicado exclusivamente a la bodega o si todos hacen múltiples tareas.',
  },
  {
    id: 5,
    sectionId: 'identificacion',
    question: '¿Cuánto tiempo lleva funcionando la empresa?',
    inputType: 'short',
    placeholder: 'Ej. 4 años y 6 meses en el sector.',
    helperText: 'Antigüedad operativa desde la apertura del local.',
  },
  {
    id: 6,
    sectionId: 'distribucion',
    question: '¿Cómo funcionan y están distribuidas las diferentes áreas de la rapi tienda?',
    inputType: 'long',
    placeholder: 'Ej. Área de exhibición frontal con neveras y góndolas, zona de caja en la entrada y una bodega trasera de aprox. 12 m²...',
    helperText: 'Describa el flujo entre punto de venta, exhibición, refrigeración, caja y trastienda o bodega.',
  },
  {
    id: 7,
    sectionId: 'distribucion',
    question: '¿Cómo están organizados los productos dentro de la bodega?',
    inputType: 'long',
    placeholder: 'Ej. Apilados en cajas sobre estibas o en el piso, agrupados según van llegando, sin señalización formal...',
    helperText: 'Indique si usan estantería metálica, apilamiento en piso, clasificación por rotación o por proveedor.',
  },
  {
    id: 8,
    sectionId: 'distribucion',
    question: '¿Tienen espacios asignados para cada tipo de producto?',
    inputType: 'long',
    placeholder: 'Ej. No del todo; solo las bebidas tienen un rincón fijo y el resto se acomoda donde haya espacio libre...',
    helperText: 'Aclare si operan con ubicaciones fijas por categoría o ubicación aleatoria según disponibilidad.',
  },
  {
    id: 9,
    sectionId: 'espacio-flujo',
    question: '¿Qué dificultades tienen por el poco espacio de almacenamiento?',
    inputType: 'long',
    placeholder: 'Ej. Obstrucción de pasillos, deterioro de empaques por apilamiento excesivo, vencimiento de productos ocultos...',
    helperText: 'Mencione daños, mermas, bloqueos de tránsito interno o limitaciones para comprar por volumen.',
  },
  {
    id: 10,
    sectionId: 'espacio-flujo',
    question: '¿Cómo organizan los productos para aprovechar mejor el espacio disponible?',
    inputType: 'long',
    placeholder: 'Ej. Se apilan cajas unas sobre otras hasta el techo, se meten paquetes debajo de las mesas o en los pasillos...',
    helperText: 'Describa qué estrategias empíricas aplican actualmente para ganar capacidad.',
  },
  {
    id: 11,
    sectionId: 'espacio-flujo',
    question: '¿Cómo separan los productos de aseo de los alimentos?',
    inputType: 'long',
    placeholder: 'Ej. Se intenta poner los detergentes en un estante aparte, pero cuando llega mucha mercancía quedan cerca de los granos...',
    helperText: 'Detalle si existe barrera física, estantería exclusiva o riesgo de contaminación cruzada/olores.',
  },
  {
    id: 12,
    sectionId: 'espacio-flujo',
    question: '¿Se presentan dificultades para encontrar o sacar productos de la bodega?',
    inputType: 'long',
    placeholder: 'Ej. Sí, toca mover varias cajas del frente para sacar lo que está al fondo y a veces se pierde mucho tiempo buscando...',
    helperText: 'Explique demoras en reposición de góndolas, doble manipulación y falta de rotación PEPS/FIFO.',
  },
  {
    id: 13,
    sectionId: 'recepcion-mejora',
    question: '¿Cómo organizan la mercancía nueva cuando llega de los proveedores?',
    inputType: 'long',
    placeholder: 'Ej. Se recibe en la puerta, se apila temporalmente en el pasillo y luego se acomoda encima o delante de lo que ya había...',
    helperText: 'Indique si verifican cantidades/fechas de vencimiento y si lo nuevo queda delante de lo antiguo.',
  },
  {
    id: 14,
    sectionId: 'recepcion-mejora',
    question: '¿Qué cambios realizarían para mejorar el orden y aprovechar el espacio de la bodega?',
    inputType: 'long',
    placeholder: 'Ej. Instalar estanterías más altas hasta el techo, etiquetar las zonas por categoría y deshacerse de cajas vacías...',
    helperText: 'Recoja las ideas de mejora planteadas por el dueño o el equipo de la tienda.',
  },
  {
    id: 15,
    sectionId: 'recepcion-mejora',
    question: '¿Que limitaciones se han presentado al tener tan poco espacio en la bodega y donde almacenan los otros productos?',
    inputType: 'long',
    placeholder: 'Ej. No se pueden aprovechar descuentos por volumen; el excedente se guarda en la casa del dueño o en un cuarto contiguo...',
    helperText: 'Indique qué mercancía queda por fuera de la bodega principal y cómo afecta las compras o ventas.',
  },
];

export const SAMPLE_ANSWERS_DYD: AnswersMap = {
  1: 'Comercio al por menor en establecimientos no especializados con surtido compuesto principalmente por alimentos, bebidas, abarrotes, lácteos, panadería empacada y artículos de aseo personal y del hogar (Rapi Tienda D y D).',
  2: 'Diego Armando Duarte (Propietario principal de Rapi Tienda D y D).',
  3: 'Diego Armando Duarte. Teléfono: +57 312 458 9021. Correo electrónico: rapitiendadyd@gmail.com. Dirección comercial: Barrio El Progreso, Carrera 14 # 22-18.',
  4: '1) Propietario / Administrador: compras a proveedores, pagos, control de caja y apertura/cierre. 2) Dos auxiliares de punto de venta: atención al cliente, cobro en caja, surtido de góndolas y limpieza. No existe un cargo exclusivo de jefe de bodega o almacenista; todos entran y acomodan según el turno.',
  5: '5 años de funcionamiento continuo en el mismo local.',
  6: 'El local tiene aproximadamente 55 m² totales: 40 m² destinados a exhibición (3 góndolas centrales, 2 neveras de bebidas y lácteos, mostrador de caja en la entrada) y una bodega trasera de unos 12 m² más un pasillo estrecho de 3 m² hacia el baño.',
  7: 'Los productos están apilados en cajas sobre estibas plásticas bajas y directamente sobre el piso en algunos sectores. No hay estanterías industriales altas ni códigos de ubicación; se agrupan de manera general por proveedor o por orden de llegada.',
  8: 'No existen espacios fijos asignados para cada línea. Únicamente las pacas de gaseosas y cervezas tienen una esquina habitual; los abarrotes, snacks y productos de aseo se reubican donde haya algún hueco disponible.',
  9: 'Pasillos bloqueados que impiden el tránsito seguro, cajas aplastadas por apilar demasiado alto, dificultad para hacer inventario físico real, quiebres de stock ocultos y deterioro o vencimiento de alimentos que quedan tapados.',
  10: 'Se apilan cajas unas encima de otras hasta 1,6 metros de altura, se aprovechan espacios debajo del mostrador de caja y se llenan las partes superiores de las góndolas de exhibición con mercancía de reserva.',
  11: 'Se procura colocar los jabones, blanqueadores y detergentes en un rincón lateral, pero cuando llega pedido grande se terminan ubicando cajas de aseo junto a bultos de arroz, azúcar o paquetes de galletas por falta de estantería divisoria.',
  12: 'Sí, con mucha frecuencia. Para sacar un producto del fondo hay que retirar de 4 a 6 cajas del frente (doble manipulación). Esto retrasa el surtido en horas pico y hace que a veces se compre mercancía repetida creyendo que se agotó.',
  13: 'El proveedor descarga en la entrada del local durante horario de atención; se revisa rápidamente la factura, se dejan las cajas en el pasillo mientras se atiende clientes y luego se apilan al frente o encima de las existencias anteriores.',
  14: 'Instalar estantería metálica pesada que aproveche la altura de 2,8 metros, señalizar zonas por categorías (alta rotación vs. baja rotación), sacar cajas vacías a diario y establecer un protocolo claro de recepción y rotación.',
  15: 'Se pierden descuentos por volumen de proveedores y ocurren faltantes los fines de semana porque no cabe stock de seguridad. Los excedentes de papel higiénico, bebidas y granos se guardan temporalmente en el garaje de la vivienda del dueño, a dos cuadras.',
};
