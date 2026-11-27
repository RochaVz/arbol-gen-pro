import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardBody, ButtonV2 as Button, InputV2 as Input, Modal } from './ui';
import {
  Users,
  TreePine,
  ImageIcon,
  Calendar,
  Plus,
  ArrowRight,
  Heart,
  Sparkles,
  Search,
  Share2,
} from 'lucide-react';

interface HomeProps {
  onAddFamily?: () => void;
  onViewTree?: () => void;
  onCreateTree?: (treeName: string, myName: string, myLastName: string) => Promise<void>;
  onSelectTree?: (treeId: string) => void;
  onOpenTree?: (treeId: string) => void;
  onOpenPhotos?: () => void;
  onOpenEvents?: () => void;
  trees?: Array<{
    id: string;
    name: string;
    description?: string;
    memberCount: number;
    isActive: boolean;
  }>;
  stats?: {
    totalFamilyMembers: number;
    generations: number;
    photos: number;
    events: number;
  };
}

export const PremiumHome: React.FC<HomeProps> = ({
  onAddFamily,
  onViewTree,
  onCreateTree,
  onSelectTree,
  onOpenTree,
  onOpenPhotos,
  onOpenEvents,
  trees = [],
  stats = { totalFamilyMembers: 0, generations: 0, photos: 0, events: 0 },
}) => {
  const [createModalOpen, setCreateModalOpen] = React.useState(false);
  const [treeName, setTreeName] = React.useState('');
  const [ownerName, setOwnerName] = React.useState('');
  const [ownerLastName, setOwnerLastName] = React.useState('');
  const [isCreating, setIsCreating] = React.useState(false);

  const openCreateModal = () => setCreateModalOpen(true);
  const closeCreateModal = () => {
    if (!isCreating) setCreateModalOpen(false);
  };

  const handleCreateTree = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!onCreateTree || !treeName.trim() || !ownerName.trim()) return;
    setIsCreating(true);
    try {
      await onCreateTree(treeName.trim(), ownerName.trim(), ownerLastName.trim());
      setCreateModalOpen(false);
      setTreeName('');
      setOwnerName('');
      setOwnerLastName('');
    } finally {
      setIsCreating(false);
    }
  };

  const isEmpty = trees.length === 0 && stats.totalFamilyMembers === 0;
  const activeTree = trees.find((tree) => tree.isActive);

  const quickActions = [
    {
      icon: <Users className="h-7 w-7" />,
      title: 'Agregar familiar',
      description: 'Añade una persona',
      colors: 'bg-[#edf4f1] text-[#2f5d50]',
      onClick: onAddFamily,
    },
    {
      icon: <ImageIcon className="h-7 w-7" />,
      title: 'Subir fotografías',
      description: 'Guarda momentos',
      colors: 'bg-[#fff2dc] text-[#a16d28]',
      onClick: onOpenPhotos,
    },
    {
      icon: <Calendar className="h-7 w-7" />,
      title: 'Registrar eventos',
      description: 'Nacimientos y recuerdos',
      colors: 'bg-[#f9e9e3] text-[#b35f45]',
      onClick: onOpenEvents,
    },
    {
      icon: <Share2 className="h-7 w-7" />,
      title: 'Compartir',
      description: 'Invita a la familia',
      colors: 'bg-[#eeeafa] text-[#6754a4]',
      onClick: onViewTree,
    },
  ];

  return (
    <motion.div
      className="space-y-7"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      {isEmpty ? (
        <section className="relative overflow-hidden rounded-[28px] bg-[#2f5d50] px-6 py-10 shadow-[0_18px_50px_rgba(47,93,80,0.18)] sm:px-10 lg:px-14 lg:py-14">
          <div className="absolute right-[-40px] top-[-55px] h-52 w-52 rounded-full border-[28px] border-[#efb66d]/20" />
          <div className="absolute bottom-[-85px] right-24 h-44 w-44 rounded-full bg-[#efb66d]/10" />
          <div className="relative max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/20">
              <Heart className="h-4 w-4 text-[#f2c27f]" />
              Nuestra historia merece ser recordada
            </div>
            <h1 className="!mb-5 max-w-2xl !text-4xl !font-bold !leading-tight !text-white sm:!text-5xl">
              Construye el árbol de tu familia
            </h1>
            <p className="mb-8 max-w-2xl !text-lg !leading-relaxed !text-[#edf5f1]">
              Guarda a quienes amas, descubre cómo están conectadas las generaciones y conserva las historias que hacen única a tu familia.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                variant="accent"
                size="lg"
                icon={<Plus className="h-5 w-5" />}
                onClick={openCreateModal}
                className="min-h-[56px] rounded-xl px-7 text-base"
              >
                Crear mi primer árbol
              </Button>
              <Button
                variant="ghost"
                size="lg"
                icon={<Search className="h-5 w-5" />}
                className="min-h-[56px] rounded-xl bg-white/10 px-6 text-base text-white hover:bg-white/20"
              >
                Cómo funciona
              </Button>
            </div>
          </div>
        </section>
      ) : (
        <>
          <section className="relative overflow-hidden rounded-[28px] bg-[#2f5d50] px-6 py-7 text-white shadow-[0_18px_50px_rgba(47,93,80,0.16)] sm:px-8 lg:px-10">
            <div className="absolute -right-10 -top-16 h-48 w-48 rounded-full border-[24px] border-white/10" />
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#f7d49f]">
                  <Sparkles className="h-4 w-4" />
                  Tu historia familiar
                </div>
                <h1 className="!mb-2 !text-3xl !font-bold !text-white sm:!text-4xl">
                  {activeTree ? activeTree.name : 'Bienvenida a tu familia'}
                </h1>
                <p className="!mb-0 max-w-xl !text-base !text-[#edf5f1]">
                  {stats.totalFamilyMembers === 1
                    ? 'Tu árbol comienza aquí. Agrega a los demás miembros poco a poco.'
                    : `${stats.totalFamilyMembers} familiares conectados en ${stats.generations} ${stats.generations === 1 ? 'generación' : 'generaciones'}.`}
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  variant="accent"
                  size="lg"
                  icon={<ArrowRight className="h-5 w-5" />}
                  onClick={onViewTree}
                  className="min-h-[52px] rounded-xl px-6"
                >
                  Ver el árbol
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  icon={<Plus className="h-5 w-5" />}
                  onClick={onAddFamily}
                  className="min-h-[52px] rounded-xl bg-white/10 px-5 text-white hover:bg-white/20"
                >
                  Agregar familiar
                </Button>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="!mb-1 text-sm font-bold uppercase tracking-[0.16em] text-[#b35f45]">Mis recuerdos</p>
                <h2 className="!mb-0 text-2xl font-bold text-slate-900">Mis árboles familiares</h2>
              </div>
              <Button
                variant="secondary"
                icon={<Plus className="h-5 w-5" />}
                onClick={openCreateModal}
                className="rounded-xl"
              >
                Nuevo árbol
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {trees.map((tree) => (
                <Card
                  key={tree.id}
                  hoverable
                  className={tree.isActive
                    ? 'rounded-[22px] border-[#84a79b] ring-2 ring-[#e8f0ec]'
                    : 'rounded-[22px]'}
                >
                  <CardBody className="space-y-5 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-[#edf4f1] text-[#2f5d50]">
                          <TreePine className="h-7 w-7" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate text-xl font-bold text-slate-900">{tree.name}</h3>
                          <p className="!mb-0 text-sm text-slate-600">
                            <Users className="mr-1 inline h-4 w-4" />
                            {tree.memberCount} {tree.memberCount === 1 ? 'persona' : 'personas'}
                          </p>
                        </div>
                      </div>
                      {tree.isActive && (
                        <span className="flex-shrink-0 rounded-full bg-[#e4f1e9] px-3 py-1.5 text-xs font-bold text-[#2f6e50]">
                          Activo
                        </span>
                      )}
                    </div>
                    {tree.description && (
                      <p className="!mb-0 text-sm text-slate-600 line-clamp-2">{tree.description}</p>
                    )}
                    <div className="grid grid-cols-[1fr_auto] gap-2">
                      <Button
                        variant="primary"
                        size="md"
                        className="rounded-xl"
                        onClick={() => onOpenTree?.(tree.id)}
                      >
                        Abrir árbol
                      </Button>
                      {!tree.isActive && (
                        <Button
                          variant="secondary"
                          size="md"
                          className="rounded-xl"
                          onClick={() => onSelectTree?.(tree.id)}
                        >
                          Activar
                        </Button>
                      )}
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div>
              <p className="!mb-1 text-sm font-bold uppercase tracking-[0.16em] text-[#b35f45]">¿Qué quieres hacer?</p>
              <h2 className="!mb-0 text-2xl font-bold text-slate-900">Acciones sencillas</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {quickActions.map((action) => (
                <motion.div
                  key={action.title}
                  whileHover={{ y: -4 }}
                  onClick={action.onClick}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') action.onClick?.();
                  }}
                  role="button"
                  tabIndex={0}
                  className="cursor-pointer"
                >
                  <Card className="h-full rounded-[22px] transition-all hover:shadow-lg">
                    <CardBody className="flex min-h-[150px] flex-col justify-between p-5">
                      <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${action.colors}`}>
                        {action.icon}
                      </div>
                      <div>
                        <h3 className="mb-1 text-lg font-bold text-slate-900">{action.title}</h3>
                        <p className="!mb-0 text-sm text-slate-600">{action.description}</p>
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>
        </>
      )}

      <Modal
        isOpen={createModalOpen}
        onClose={closeCreateModal}
        title="Crear nuevo árbol genealógico"
        closeLabel="Cancelar"
      >
        <form onSubmit={handleCreateTree} className="space-y-4">
          <Input
            id="tree-name"
            label="Nombre del árbol"
            value={treeName}
            onChange={(event) => setTreeName(event.target.value)}
            placeholder="Ej. Familia Rodríguez"
            required
          />
          <Input
            id="owner-name"
            label="Tu nombre"
            value={ownerName}
            onChange={(event) => setOwnerName(event.target.value)}
            placeholder="Nombre"
            required
          />
          <Input
            id="owner-last-name"
            label="Tus apellidos"
            value={ownerLastName}
            onChange={(event) => setOwnerLastName(event.target.value)}
            placeholder="Apellidos"
          />
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isCreating}
            disabled={!treeName.trim() || !ownerName.trim()}
          >
            Crear y abrir árbol
          </Button>
        </form>
      </Modal>
    </motion.div>
  );
};

PremiumHome.displayName = 'PremiumHome';
