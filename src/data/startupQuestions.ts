export interface StartupQuestion {
  id: string
  category: string
  question: string
  type: 'radio' | 'checkbox' | 'number' | 'text' | 'select'
  options?: string[]
  weight: number // Peso para el cálculo de horas
  description?: string
}

export interface StartupProjectType {
  id: string
  name: string
  description: string
  baseHours: number
  complexity: 'low' | 'medium' | 'high'
  features: string[]
  estimatedCost: number
}

export const startupProjectTypes: StartupProjectType[] = [
  {
    id: 'mvp-web',
    name: 'MVP Web App',
    description: 'Aplicación web mínima viable para validar idea de negocio',
    baseHours: 240,
    complexity: 'medium',
    features: ['Autenticación', 'Dashboard básico', 'CRUD principal', 'Responsive design'],
    estimatedCost: 18000
  },
  {
    id: 'mvp-mobile',
    name: 'MVP Mobile App',
    description: 'Aplicación móvil nativa o híbrida para validar mercado',
    baseHours: 320,
    complexity: 'high',
    features: ['Autenticación móvil', 'Push notifications', 'Offline mode', 'App store deployment'],
    estimatedCost: 25000
  },
  {
    id: 'ecommerce',
    name: 'E-commerce Platform',
    description: 'Plataforma completa de comercio electrónico',
    baseHours: 480,
    complexity: 'high',
    features: ['Catálogo de productos', 'Carrito de compras', 'Pasarela de pagos', 'Panel de administración'],
    estimatedCost: 35000
  },
  {
    id: 'saas-platform',
    name: 'SaaS Platform',
    description: 'Software como servicio con suscripciones y múltiples usuarios',
    baseHours: 600,
    complexity: 'high',
    features: ['Multi-tenancy', 'Sistema de suscripciones', 'Analytics', 'API REST'],
    estimatedCost: 45000
  },
  {
    id: 'marketplace',
    name: 'Marketplace',
    description: 'Plataforma que conecta compradores y vendedores',
    baseHours: 720,
    complexity: 'high',
    features: ['Perfiles de usuario', 'Sistema de reviews', 'Chat/mensajería', 'Comisiones'],
    estimatedCost: 55000
  },
  {
    id: 'social-network',
    name: 'Social Network',
    description: 'Red social con funcionalidades de conexión y contenido',
    baseHours: 800,
    complexity: 'high',
    features: ['Perfiles de usuario', 'Feed de contenido', 'Sistema de followers', 'Mensajería'],
    estimatedCost: 65000
  }
]

export const startupQuestions: StartupQuestion[] = [
  // Información Básica
  {
    id: 'project-type',
    category: 'Información Básica',
    question: '¿Qué tipo de proyecto es?',
    type: 'select',
    options: startupProjectTypes.map(type => type.name),
    weight: 1,
    description: 'Selecciona el tipo de proyecto que mejor describe tu idea'
  },
  {
    id: 'target-audience',
    category: 'Información Básica',
    question: '¿Cuál es tu público objetivo principal?',
    type: 'select',
    options: [
      'Consumidores finales (B2C)',
      'Empresas pequeñas (B2B)',
      'Empresas medianas/grandes (B2B)',
      'Desarrolladores (B2D)',
      'Educación (EdTech)',
      'Salud (HealthTech)',
      'Finanzas (FinTech)',
      'Otro'
    ],
    weight: 0.8,
    description: 'Define tu mercado objetivo para ajustar la estrategia'
  },
  {
    id: 'business-model',
    category: 'Información Básica',
    question: '¿Cuál es tu modelo de negocio principal?',
    type: 'select',
    options: [
      'Suscripción mensual/anual',
      'Pago por uso',
      'Comisiones por transacción',
      'Publicidad',
      'Licencias de software',
      'Marketplace fees',
      'Freemium',
      'Pago único',
      'Otro'
    ],
    weight: 0.7,
    description: 'Define cómo planeas monetizar tu producto'
  },

  // Funcionalidades Core
  {
    id: 'authentication',
    category: 'Funcionalidades Core',
    question: '¿Qué tipo de autenticación necesitas?',
    type: 'checkbox',
    options: [
      'Registro/Login básico',
      'Login con redes sociales (Google, Facebook, etc.)',
      'Autenticación de dos factores (2FA)',
      'SSO (Single Sign-On)',
      'Autenticación empresarial (LDAP/Active Directory)',
      'Verificación por email/SMS'
    ],
    weight: 0.6,
    description: 'Selecciona los métodos de autenticación requeridos'
  },
  {
    id: 'user-management',
    category: 'Funcionalidades Core',
    question: '¿Qué funcionalidades de gestión de usuarios necesitas?',
    type: 'checkbox',
    options: [
      'Perfiles de usuario básicos',
      'Roles y permisos',
      'Equipos/organizaciones',
      'Invitar usuarios',
      'Gestión de suscripciones',
      'Panel de administración',
      'Analytics de usuarios'
    ],
    weight: 0.8,
    description: 'Define las capacidades de gestión de usuarios'
  },
  {
    id: 'content-management',
    category: 'Funcionalidades Core',
    question: '¿Qué tipo de contenido necesitas gestionar?',
    type: 'checkbox',
    options: [
      'Páginas estáticas',
      'Blog/Noticias',
      'Catálogo de productos',
      'Contenido multimedia (imágenes, videos)',
      'Documentos/PDFs',
      'Comentarios/Reviews',
      'Contenido generado por usuarios (UGC)',
      'Sistema de tags/categorías'
    ],
    weight: 0.7,
    description: 'Selecciona los tipos de contenido que manejarás'
  },

  // Integraciones
  {
    id: 'payment-integration',
    category: 'Integraciones',
    question: '¿Qué integraciones de pago necesitas?',
    type: 'checkbox',
    options: [
      'Stripe',
      'PayPal',
      'MercadoPago',
      'Transferencias bancarias',
      'Criptomonedas',
      'Facturación automática',
      'Suscripciones recurrentes',
      'Múltiples monedas'
    ],
    weight: 0.9,
    description: 'Selecciona las pasarelas de pago requeridas'
  },
  {
    id: 'third-party-integrations',
    category: 'Integraciones',
    question: '¿Qué integraciones de terceros necesitas?',
    type: 'checkbox',
    options: [
      'Email marketing (Mailchimp, SendGrid)',
      'Analytics (Google Analytics, Mixpanel)',
      'CRM (HubSpot, Salesforce)',
      'Chat en vivo (Intercom, Zendesk)',
      'Redes sociales (Facebook, Twitter, Instagram)',
      'Google Maps/Ubicación',
      'Notificaciones push',
      'Calendario (Google Calendar, Outlook)',
      'Almacenamiento en la nube (AWS S3, Google Cloud)',
      'Base de datos externa'
    ],
    weight: 0.6,
    description: 'Selecciona las integraciones externas necesarias'
  },

  // Diseño y UX
  {
    id: 'design-requirements',
    category: 'Diseño y UX',
    question: '¿Qué requisitos de diseño tienes?',
    type: 'checkbox',
    options: [
      'Diseño responsive (móvil, tablet, desktop)',
      'Diseño nativo para iOS/Android',
      'Branding personalizado',
      'Iconografía personalizada',
      'Animaciones y micro-interacciones',
      'Modo oscuro',
      'Accesibilidad (WCAG 2.1)',
      'Internacionalización (i18n)',
      'Progressive Web App (PWA)'
    ],
    weight: 0.7,
    description: 'Define los requisitos de diseño y experiencia de usuario'
  },
  {
    id: 'ui-framework',
    category: 'Diseño y UX',
    question: '¿Prefieres algún framework de UI específico?',
    type: 'select',
    options: [
      'Material Design (Google)',
      'Ant Design',
      'Bootstrap',
      'Tailwind CSS',
      'Chakra UI',
      'Mantine',
      'Diseño personalizado',
      'No tengo preferencia'
    ],
    weight: 0.3,
    description: 'Selecciona el framework de UI preferido'
  },

  // Tecnología y Escalabilidad
  {
    id: 'tech-stack',
    category: 'Tecnología y Escalabilidad',
    question: '¿Qué stack tecnológico prefieres?',
    type: 'select',
    options: [
      'React + Node.js (Recomendado para startups)',
      'Vue.js + Node.js',
      'Angular + .NET',
      'React Native (Mobile)',
      'Flutter (Mobile)',
      'Python + Django/Flask',
      'Ruby on Rails',
      'PHP + Laravel',
      'No tengo preferencia'
    ],
    weight: 0.5,
    description: 'Selecciona el stack tecnológico preferido'
  },
  {
    id: 'scalability-requirements',
    category: 'Tecnología y Escalabilidad',
    question: '¿Qué requisitos de escalabilidad tienes?',
    type: 'checkbox',
    options: [
      'Arquitectura cloud-native',
      'Microservicios',
      'Load balancing',
      'CDN para contenido estático',
      'Caché distribuido (Redis)',
      'Base de datos escalable',
      'Monitoreo y alertas',
      'Backup automático',
      'CI/CD pipeline',
      'Containerización (Docker)'
    ],
    weight: 0.8,
    description: 'Define los requisitos de escalabilidad y infraestructura'
  },
  {
    id: 'expected-users',
    category: 'Tecnología y Escalabilidad',
    question: '¿Cuántos usuarios esperas en los primeros 6 meses?',
    type: 'select',
    options: [
      'Menos de 1,000 usuarios',
      '1,000 - 10,000 usuarios',
      '10,000 - 100,000 usuarios',
      'Más de 100,000 usuarios',
      'No estoy seguro'
    ],
    weight: 0.6,
    description: 'Estima el volumen de usuarios para dimensionar la infraestructura'
  },

  // Funcionalidades Avanzadas
  {
    id: 'advanced-features',
    category: 'Funcionalidades Avanzadas',
    question: '¿Qué funcionalidades avanzadas necesitas?',
    type: 'checkbox',
    options: [
      'Búsqueda avanzada con filtros',
      'Sistema de recomendaciones',
      'Machine Learning/AI',
      'Chat en vivo',
      'Video conferencias',
      'Streaming de video',
      'Real-time updates (WebSockets)',
      'Sistema de notificaciones',
      'Gamificación (puntos, badges)',
      'API pública para desarrolladores',
      'Webhooks',
      'Integración con IoT'
    ],
    weight: 1.0,
    description: 'Selecciona las funcionalidades avanzadas requeridas'
  },
  {
    id: 'security-requirements',
    category: 'Funcionalidades Avanzadas',
    question: '¿Qué requisitos de seguridad necesitas?',
    type: 'checkbox',
    options: [
      'SSL/TLS encryption',
      'GDPR compliance',
      'HIPAA compliance (salud)',
      'PCI DSS compliance (pagos)',
      'Audit logs',
      'Penetration testing',
      'Vulnerability scanning',
      'Data encryption at rest',
      'Backup encryption',
      'Multi-factor authentication'
    ],
    weight: 0.9,
    description: 'Define los requisitos de seguridad y compliance'
  },

  // Timeline y Entregables
  {
    id: 'timeline',
    category: 'Timeline y Entregables',
    question: '¿Cuál es tu timeline preferido?',
    type: 'select',
    options: [
      'MVP en 4-6 semanas (muy rápido)',
      'MVP en 8-12 semanas (estándar)',
      'MVP en 16-20 semanas (detallado)',
      'Producto completo en 6-12 meses',
      'No tengo restricciones de tiempo'
    ],
    weight: 0.4,
    description: 'Define el timeline de desarrollo preferido'
  },
  {
    id: 'deliverables',
    category: 'Timeline y Entregables',
    question: '¿Qué entregables necesitas?',
    type: 'checkbox',
    options: [
      'Código fuente completo',
      'Documentación técnica',
      'Manual de usuario',
      'Manual de administración',
      'Capacitación del equipo',
      'Soporte post-lanzamiento (3 meses)',
      'Mantenimiento continuo',
      'Optimización de performance',
      'SEO y marketing digital',
      'App store submission'
    ],
    weight: 0.5,
    description: 'Selecciona los entregables adicionales requeridos'
  }
]

// Función para calcular horas basada en respuestas
export function calculateStartupHours(answers: Record<string, any>): {
  totalHours: number
  breakdown: Record<string, number>
  estimatedCost: number
  timeline: number
} {
  let totalHours = 0
  const breakdown: Record<string, number> = {
    'Diseño UX/UI': 0,
    'Desarrollo Frontend': 0,
    'Desarrollo Backend': 0,
    'Integraciones': 0,
    'Testing & QA': 0,
    'DevOps & Deployment': 0,
    'Documentación': 0
  }

  // Base hours según tipo de proyecto
  const projectType = startupProjectTypes.find(type => type.name === answers['project-type'])
  if (projectType) {
    totalHours = projectType.baseHours
  } else {
    // Default si no se selecciona tipo de proyecto
    totalHours = 240 // MVP Web App por defecto
  }

  // Ajustes basados en respuestas
  const adjustments: Record<string, number> = {}

  // Calcular ajustes por categoría
  Object.keys(answers).forEach(questionId => {
    const question = startupQuestions.find(q => q.id === questionId)
    if (!question) return

    const answer = answers[questionId]
    let adjustment = 0

    if (Array.isArray(answer) && answer.length > 0) {
      // Checkbox - múltiples selecciones
      adjustment = answer.length * question.weight * 8 // 8 horas por opción seleccionada
    } else if (typeof answer === 'string' && answer.trim() !== '') {
      // Select/Radio - una selección
      adjustment = question.weight * 16 // 16 horas por selección
    } else if (typeof answer === 'number' && answer > 0) {
      // Number - valor numérico
      adjustment = answer * question.weight
    }

    if (adjustment > 0) {
      adjustments[question.category] = (adjustments[question.category] || 0) + adjustment
    }
  })

  // Distribuir horas por categoría con mejor manejo de errores
  breakdown['Diseño UX/UI'] = Math.round(totalHours * 0.25 + (adjustments['Funcionalidades Core'] || 0))
  breakdown['Desarrollo Frontend'] = Math.round(totalHours * 0.30)
  breakdown['Desarrollo Backend'] = Math.round(totalHours * 0.25)
  breakdown['Integraciones'] = Math.round(adjustments['Integraciones'] || 0)
  breakdown['Testing & QA'] = Math.round(totalHours * 0.10)
  breakdown['DevOps & Deployment'] = Math.round(totalHours * 0.05 + (adjustments['Tecnología y Escalabilidad'] || 0))
  breakdown['Documentación'] = Math.round(totalHours * 0.05)

  // Asegurar que no haya valores negativos
  Object.keys(breakdown).forEach(key => {
    breakdown[key] = Math.max(0, breakdown[key])
  })

  // Recalcular total
  totalHours = Object.values(breakdown).reduce((sum, hours) => sum + hours, 0)

  // Asegurar un mínimo de horas
  if (totalHours < 40) {
    totalHours = 40
    breakdown['Desarrollo Frontend'] = Math.max(breakdown['Desarrollo Frontend'], 12)
    breakdown['Desarrollo Backend'] = Math.max(breakdown['Desarrollo Backend'], 12)
    breakdown['Diseño UX/UI'] = Math.max(breakdown['Diseño UX/UI'], 8)
    breakdown['Testing & QA'] = Math.max(breakdown['Testing & QA'], 4)
    breakdown['DevOps & Deployment'] = Math.max(breakdown['DevOps & Deployment'], 2)
    breakdown['Documentación'] = Math.max(breakdown['Documentación'], 2)
  }

  // Calcular costo (tarifa promedio $60/hora)
  const estimatedCost = Math.round(totalHours * 60)

  // Calcular timeline (asumiendo 40 horas/semana por desarrollador)
  const timeline = Math.ceil(totalHours / 40)

  return {
    totalHours,
    breakdown,
    estimatedCost,
    timeline
  }
} 