import React from "react";
import { Card } from '../../shared/components/ui/Card';
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
    const recentRelatives = familyMembers.slice(0, 4);

    return (
      <div
        ref={ref}
        className={`
          min-h-screen bg-paper text-ink
          py-4 sm:py-6 px-4 sm:px-6
          ${className}
        `.trim()}
      >
        {/* Encabezado emocional */}
        <header className="max-w-2xl mx-auto mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-ink font-serif-titles mb-2 leading-tight">
            Tu historia familiar
          </h1>
          <p className="text-lg text-wood font-serif-content leading-relaxed">
            Un lugar para preservar el legado, las fotografías y los recuerdos de
            generaciones pasadas, presentes y futuras.
          </p>
        </header>

        <main className="max-w-2xl mx-auto space-y-8 sm:space-y-12">
          {/* 1. Árbol destacado */}
          <section className="w-full">
            <FeaturedTree
              title={treeName}
              subtitle={treeSubtitle}
              members={familyMembers}
              photoUrl={treePhotoUrl}
              onViewTree={onViewTree}
              onAddMember={onAddMember}
            />
          </section>

          {/* 2. Actividad reciente y familiares recientes en fila */}
          <section className="w-full grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            <Card elevated radius="lg" className="bg-surface-elevated border border-parchment shadow-lg">
              <RecentActivity items={recentActivity} onViewAll={() => {}} />
            </Card>

            <Card elevated radius="lg" className="bg-surface-elevated border border-parchment shadow-lg">
              <div className="p-6 sm:p-8">
                <h3 className="text-lg font-semibold text-ink font-serif-titles mb-4 sm:mb-6">
                  Familiares agregados recientemente
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  {recentRelatives.length === 0 ? (
                    <p className="text-wood text-sm font-serif-content text-center py-4">
                      Aún no hay familiares registrados.
                    </p>
                  ) : (
                    recentRelatives.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-3 sm:gap-4"
                      >
                        <div className="w-10 h-10 flex-shrink-0 bg-parchment border border-border rounded-lg flex items-center justify-center text-sepia">
                          {member.lifeStatus === 'deceased' ? '✝' : '👤'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-semibold text-ink font-serif-titles leading-tight">
                            {member.firstName} {member.lastName ?? ''}
                          </p>
                          <p className="text-sm text-wood">
                            {member.lifeStatus === 'deceased' ? 'Fallecido' : 'Vivo'}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </Card>
          </section>

          {/* 3. Recuerdos destacados */}
          <section className="w-full">
            <FeaturedMemories items={memories} onViewMemory={onViewMemory} />
          </section>

          {/* Acciones rápidas */}
          <section className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <Button size="lg" fullWidth variant="primary" onClick={onAddMember}>
              ➕ Agregar familiar
            </Button>
            <Button size="lg" fullWidth variant="secondary" onClick={onViewTree}>
              🌳 Ver árbol familiar
            </Button>
            <Button size="lg" fullWidth variant="ghost" onClick={onViewTree}>
              📖 Explorar recuerdos
            </Button>
          </section>
        </main>
      </div>
    );
  },
);

Home.displayName = 'Home';