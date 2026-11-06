import React from "react";
import { Button } from '../../shared/components/ui/Button';
import { FeaturedTree } from './components/FeaturedTree';
import { RecentActivity } from './components/RecentActivity';
import { FeaturedMemories } from './components/FeaturedMemories';
import type { Person } from '../../core/db/schema';

/**
 * Home — Landing interna emocional del árbol familiar.
 * No es un dashboard administrativo: es un álbum de bienvenida.
 * Módulos: árbol destacado, actividad reciente, familiares recientes, recuerdos destacados.
 */
export interface HomeProps {
  treeName: string;
  treeSubtitle: string;
  treePhotoUrl?: string;
  familyMembers: Person[];
  recentActivity: Array<{
    id: string;
    personName: string;
    action: 'agregó' | 'actualizó' | 'añadió foto' | 'conectó';
    target?: string;
    when: string;
    photoUrl?: string;
  }>;
  memories: Array<{
    id: string;
    title: string;
    description?: string;
    photoUrl?: string;
    date?: string;
    type?: 'photo' | 'document' | 'story';
  }>;
  onViewTree: () => void;
  onAddMember: () => void;
  onViewMemory: (id: string) => void;
  className?: string;
}

export const Home = React.forwardRef<HTMLDivElement, HomeProps>(
  ({
    treeName,
    treeSubtitle,
    treePhotoUrl,
    familyMembers,
    recentActivity,
    memories,
    onViewTree,
    onAddMember,
    onViewMemory,
    className = '',
  }, ref) => {
    const recentRelatives = familyMembers.slice(0, 6);

    return (
      <div
        ref={ref}
        className={`
          min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100
          text-neutral-900
          py-8 sm:py-12 px-4 sm:px-6 lg:px-8
          ${className}
        `.trim()}
      >
        {/* Encabezado hero */}
        <header className="max-w-5xl mx-auto mb-12 sm:mb-16">
          <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 border border-neutral-200">
            <h1 className="text-4xl sm:text-5xl font-bold text-neutral-900 font-serif-titles mb-4 leading-tight">
              🌳 {treeName}
            </h1>
            <p className="text-xl text-neutral-700 font-serif-content leading-relaxed mb-6">
              {treeSubtitle}
            </p>
            <p className="text-base text-neutral-600 mb-8 leading-relaxed">
              Un lugar para preservar el legado, las fotografías y los recuerdos de
              generaciones pasadas, presentes y futuras.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Button size="lg" variant="primary" onClick={onViewTree}>
                🌳 Ver árbol completo
              </Button>
              <Button size="lg" variant="secondary" onClick={onAddMember}>
                ➕ Agregar familiar
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto space-y-10">
          {/* 1. Árbol destacado con mejor elevación */}
          <section className="w-full">
            <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 overflow-hidden">
              <FeaturedTree
                title={treeName}
                subtitle={treeSubtitle}
                members={familyMembers}
                photoUrl={treePhotoUrl}
                onViewTree={onViewTree}
                onAddMember={onAddMember}
              />
            </div>
          </section>

          {/* 2. Dos columnas: Actividad reciente + Familiares recientes */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Actividad reciente - ocupa 2 columnas en desktop */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 overflow-hidden">
                <div className="p-6 sm:p-8 border-b border-neutral-200">
                  <h2 className="text-2xl font-bold text-neutral-900 font-serif-titles">
                    📰 Actividad reciente
                  </h2>
                </div>
                <div className="p-6 sm:p-8">
                  {recentActivity.length === 0 ? (
                    <p className="text-neutral-600 text-center py-8">
                      No hay actividad registrada aún.
                    </p>
                  ) : (
                    <div className="space-y-6">
                      <RecentActivity items={recentActivity} onViewAll={() => {}} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Familiares recientes - ocupa 1 columna */}
            <div>
              <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 overflow-hidden">
                <div className="p-6 sm:p-8 border-b border-neutral-200">
                  <h3 className="text-xl font-bold text-neutral-900 font-serif-titles">
                    👥 Familia
                  </h3>
                  <p className="text-sm text-neutral-600 mt-1">
                    {recentRelatives.length} miembro(s)
                  </p>
                </div>
                <div className="p-6 sm:p-8">
                  <div className="space-y-4">
                    {recentRelatives.length === 0 ? (
                      <p className="text-neutral-600 text-sm text-center py-6">
                        Sin familiares registrados
                      </p>
                    ) : (
                      recentRelatives.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center gap-4 p-3 rounded-lg hover:bg-neutral-50 transition-colors"
                        >
                          <div className="w-12 h-12 flex-shrink-0 bg-gradient-to-br from-primary-100 to-primary-50 border-2 border-primary-200 rounded-full flex items-center justify-center text-lg font-bold">
                            {member.firstName.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-neutral-900 truncate">
                              {member.firstName}
                            </p>
                            <p className="text-xs text-neutral-600">
                              {member.lifeStatus === 'deceased' ? '(Fallecido)' : 'Vivo'}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Recuerdos destacados con mejor estructura */}
          <section className="w-full">
            <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 overflow-hidden">
              <div className="p-6 sm:p-8 border-b border-neutral-200">
                <h2 className="text-2xl font-bold text-neutral-900 font-serif-titles">
                  📸 Recuerdos destacados
                </h2>
              </div>
              <div className="p-6 sm:p-8">
                {memories.length === 0 ? (
                  <p className="text-neutral-600 text-center py-8">
                    No hay recuerdos aún. ¡Comienza a guardar tus momentos especiales!
                  </p>
                ) : (
                  <FeaturedMemories items={memories} onViewMemory={onViewMemory} />
                )}
              </div>
            </div>
          </section>

          {/* Acciones rápidas al final */}
          <section className="w-full">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Button size="lg" fullWidth variant="vibrant" onClick={onAddMember}>
                ➕ Agregar familiar
              </Button>
              <Button size="lg" fullWidth variant="primary" onClick={onViewTree}>
                🌳 Explorar árbol
              </Button>
              <Button size="lg" fullWidth variant="secondary" onClick={() => onViewMemory('')}>
                📸 Ver galería
              </Button>
            </div>
          </section>
        </main>
      </div>
    );
  },
);

Home.displayName = 'Home';