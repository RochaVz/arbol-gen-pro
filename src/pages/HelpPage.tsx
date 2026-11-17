import { useState } from 'react';
import { HelpCircle, ChevronDown, TreePine, Image, Settings, Plus } from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'inicio' | 'arbol' | 'fotos' | 'general';
}

const faqItems: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'inicio',
    question: '¿Cómo creo mi primer árbol genealógico?',
    answer:
      'En la pantalla de inicio, haz clic en "Crear Primer Árbol". Ingresa el nombre de tu familia y tus datos básicos. Verás tu nombre en el árbol como el nodo principal, desde donde podrás agregar a otros miembros.',
  },
  {
    id: 'faq-2',
    category: 'inicio',
    question: '¿Puedo tener múltiples árboles genealógicos?',
    answer:
      'Sí, puedes crear varios árboles (p. ej., familia materna y paterna). En Configuración, selecciona cuál es tu árbol activo. Los filtros y vistas se basarán en el árbol seleccionado.',
  },
  {
    id: 'faq-3',
    category: 'arbol',
    question: '¿Cómo agrego miembros a mi árbol?',
    answer:
      'En la vista del Árbol Genealógico, puedes hacer clic en el botón "+ Agregar Familiar" o seleccionar una persona existente en "Mi Familia" y vincular nuevos parientes. También puedes crear personas nuevas directamente desde el modal de búsqueda.',
  },
  {
    id: 'faq-4',
    category: 'arbol',
    question: '¿Qué significa "Generación"?',
    answer:
      'Las generaciones se calculan automáticamente desde la raíz del árbol. Gen 1 es tu ancepasado más antiguo, Gen 2 sus hijos, etc. El app calcula esto usando la estructura de relaciones.',
  },
  {
    id: 'faq-5',
    category: 'arbol',
    question: '¿Puedo reorganizar el árbol?',
    answer:
      'El árbol se organiza automáticamente en un layout jerárquico. Puedes hacer zoom con la rueda del mouse, arrastrarlo con el botón derecho, y hacer clic en personas para enfocarte en ellas.',
  },
  {
    id: 'faq-6',
    category: 'fotos',
    question: '¿Cómo agrego fotos a un miembro?',
    answer:
      'Ve al perfil de cualquier miembro y busca la sección "Fotografías". Haz clic en "+ Agregar Foto" para cargar desde tu dispositivo. Las fotos se mostrarán en la galería bajo el nombre de esa persona.',
  },
  {
    id: 'faq-7',
    category: 'fotos',
    question: '¿Dónde puedo ver todas las fotos de mi árbol?',
    answer:
      'En la sección "Fotografías" del menú lateral, verás una galería masonry de todas las fotos de tu árbol activo. Puedes filtrar por miembro o descargarlas.',
  },
  {
    id: 'faq-8',
    category: 'general',
    question: '¿Mis datos se sincronizarán entre dispositivos?',
    answer:
      'Si inicia sesión con tu correo, tus árboles se guardarán en la nube y se sincronizarán en tiempo real. Sin cuenta, todo se guarda localmente en tu navegador.',
  },
  {
    id: 'faq-9',
    category: 'general',
    question: '¿Puedo exportar mis datos?',
    answer:
      'Sí, en Configuración > Gestión de Datos, haz clic en "Exportar" para descargar un archivo JSON con todos tus árboles genealógicos.',
  },
  {
    id: 'faq-10',
    category: 'general',
    question: '¿Es seguro guardar mis datos aquí?',
    answer:
      'Tus datos se almacenan de forma segura usando encriptación. Los datos locales nunca se envían sin tu consentimiento. Lee nuestra política de privacidad para más detalles.',
  },
];

export function HelpPage() {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<'all' | FAQItem['category']>('all');

  const toggleItem = (id: string) => {
    const next = new Set(openItems);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setOpenItems(next);
  };

  const filteredFAQ = selectedCategory === 'all'
    ? faqItems
    : faqItems.filter((item) => item.category === selectedCategory);

  const categories: Array<{ id: FAQItem['category'] | 'all'; label: string; icon: React.ReactNode }> = [
    { id: 'all', label: 'Todas', icon: <HelpCircle className="w-4 h-4" /> },
    { id: 'inicio', label: 'Inicio', icon: <Plus className="w-4 h-4" /> },
    { id: 'arbol', label: 'Árbol', icon: <TreePine className="w-4 h-4" /> },
    { id: 'fotos', label: 'Fotos', icon: <Image className="w-4 h-4" /> },
    { id: 'general', label: 'General', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
          <HelpCircle className="w-8 h-8" />
          Ayuda y Guía
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Encuentra respuestas a las preguntas frecuentes sobre cómo usar Árbol Gen Pro
        </p>
      </div>

      {/* Quick Start Guide */}
      <section className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 rounded-lg border border-green-200 dark:border-green-700 p-6 space-y-4">
        <h2 className="text-xl font-bold text-green-900 dark:text-green-100">🚀 Guía Rápida</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Step 1 */}
          <div className="bg-white dark:bg-neutral-900 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h3 className="font-semibold text-neutral-900 dark:text-white">Crea tu árbol</h3>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 ml-11">
              Desde el inicio, crea un nuevo árbol genealógico con tu nombre como raíz.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white dark:bg-neutral-900 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h3 className="font-semibold text-neutral-900 dark:text-white">Agrega familiares</h3>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 ml-11">
              Usa "Mi Familia" o el botón "+ Agregar" en el árbol para vincular parientes.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white dark:bg-neutral-900 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h3 className="font-semibold text-neutral-900 dark:text-white">Agrega fotos</h3>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 ml-11">
              Carga fotos en el perfil de cada persona para tu galería familiar.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-white dark:bg-neutral-900 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm">
                4
              </div>
              <h3 className="font-semibold text-neutral-900 dark:text-white">Explora y comparte</h3>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 ml-11">
              Visualiza tu árbol, busca miembros, exporta o comparte tu genealogía.
            </p>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id as 'all' | FAQItem['category'])}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === cat.id
                ? 'bg-green-600 text-white'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }`}
          >
            {cat.icon}
            {cat.label}
          </button>
        ))}
      </div>

      {/* FAQ */}
      <div className="space-y-3">
        {filteredFAQ.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden"
          >
            {/* Question */}
            <button
              onClick={() => toggleItem(item.id)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-left"
            >
              <h3 className="font-semibold text-neutral-900 dark:text-white">{item.question}</h3>
              <ChevronDown
                className={`w-5 h-5 text-neutral-600 dark:text-neutral-400 flex-shrink-0 transition-transform ${
                  openItems.has(item.id) ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Answer */}
            {openItems.has(item.id) && (
              <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800">
                <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">{item.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Contact Section */}
      <section className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6 space-y-4">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white">¿No encontraste tu respuesta?</h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          Si tienes más preguntas, contáctanos a través de nuestros canales de soporte.
        </p>
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-colors">
            Enviar mensaje
          </button>
          <button className="px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
            Ver documentación
          </button>
        </div>
      </section>

      {/* Tips Section */}
      <section className="bg-blue-50 dark:bg-blue-900 rounded-lg border border-blue-200 dark:border-blue-700 p-6 space-y-4">
        <h2 className="text-lg font-bold text-blue-900 dark:text-blue-100">💡 Consejos</h2>
        <ul className="space-y-2 text-blue-900 dark:text-blue-100 text-sm">
          <li>✓ Usa fotos claras y recientes para identificar fácilmente a los miembros</li>
          <li>✓ Completa la información de cada persona para generaciones más precisas</li>
          <li>✓ Los datos se sincronizarán automáticamente si tienes sesión abierta</li>
          <li>✓ Puedes descargar tu árbol en cualquier momento desde Configuración</li>
          <li>✓ En móvil, usa la vista de lista para explorar más fácilmente</li>
        </ul>
      </section>
    </div>
  );
}
