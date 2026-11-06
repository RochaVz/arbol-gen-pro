import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardBody, ButtonV2 as Button } from './ui';
import {
  MetricCard,
  DashboardGrid,
  ChartContainer,
} from './ui/DashboardComponents';
import { Users, TreePine, ImageIcon, Calendar, Plus, ArrowRight } from 'lucide-react';

interface HomeProps {
  onAddFamily?: () => void;
  onViewTree?: () => void;
  onLoadTestData?: () => void;
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
  onLoadTestData,
  stats = {
    totalFamilyMembers: 0,
    generations: 0,
    photos: 0,
    events: 0,
  },
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const isEmpty = stats.totalFamilyMembers === 0;

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {isEmpty ? (
        // Empty state - hero section
        <motion.div variants={itemVariants}>
          <Card className="border-2 border-dashed border-slate-300">
            <CardBody className="py-16 px-8 text-center">
              <motion.div
                className="inline-block mb-6"
                whileHover={{ scale: 1.1 }}
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center">
                  <TreePine className="w-10 h-10 text-primary-600" />
                </div>
              </motion.div>

              <h2 className="text-3xl font-bold text-slate-900 mb-3">
                Comienza tu árbol genealógico
              </h2>
              <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
                Conecta con tu historia y documenta tu legado familiar. Crea tu
                primer árbol y comienza a agregar a tus seres queridos.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  variant="primary"
                  size="lg"
                  icon={<Plus className="w-5 h-5" />}
                  onClick={onAddFamily}
                >
                  Crear árbol familiar
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  icon={<ArrowRight className="w-5 h-5" />}
                >
                  Ver tutorial
                </Button>
                {/* Dev debug button */}
                {import.meta.env.DEV && (
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={onLoadTestData}
                  >
                    Cargar datos de prueba
                  </Button>
                )}
              </div>
            </CardBody>
          </Card>
        </motion.div>
      ) : (
        <>
          {/* Metrics grid */}
          <motion.div variants={itemVariants}>
            <DashboardGrid>
              <MetricCard
                icon={<Users className="w-6 h-6" />}
                label="Familiares"
                value={stats.totalFamilyMembers}
                trend={{ value: 12, direction: 'up', period: 'Este mes' }}
                color="primary"
              />
              <MetricCard
                icon={<TreePine className="w-6 h-6" />}
                label="Generaciones"
                value={stats.generations}
                color="secondary"
              />
              <MetricCard
                icon={<ImageIcon className="w-6 h-6" />}
                label="Fotografías"
                value={stats.photos}
                trend={{ value: 8, direction: 'up', period: 'Esta semana' }}
                color="accent"
              />
              <MetricCard
                icon={<Calendar className="w-6 h-6" />}
                label="Eventos"
                value={stats.events}
                color="success"
              />
            </DashboardGrid>
          </motion.div>

          {/* Featured tree section */}
          <motion.div variants={itemVariants}>
            <ChartContainer
              title="Tu Árbol Genealógico"
              subtitle="Visualización interactiva de tu familia"
              headerAction={
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<ArrowRight className="w-4 h-4" />}
                  onClick={onViewTree}
                >
                  Ver completo
                </Button>
              }
            >
              <div className="h-96 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg flex items-center justify-center border border-slate-200">
                <div className="text-center">
                  <TreePine className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-600 font-medium">
                    Visualización del árbol genealógico
                  </p>
                  <p className="text-sm text-slate-500">
                    Haz clic en "Ver completo" para explorar
                  </p>
                </div>
              </div>
            </ChartContainer>
          </motion.div>

          {/* Quick actions */}
          <motion.div variants={itemVariants}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: <Plus className="w-6 h-6" />,
                  title: 'Agregar Familiar',
                  description: 'Añade nuevos miembros a tu árbol',
                  color: 'primary',
                },
                {
                  icon: <ImageIcon className="w-6 h-6" />,
                  title: 'Subir Fotografías',
                  description: 'Documenta momentos especiales',
                  color: 'accent',
                },
                {
                  icon: <Calendar className="w-6 h-6" />,
                  title: 'Registrar Eventos',
                  description: 'Marca hitos importantes',
                  color: 'secondary',
                },
              ].map((action, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="hover:shadow-lg transition-all cursor-pointer h-full">
                    <CardBody className="flex flex-col items-center text-center space-y-4">
                      <div
                        className={`p-4 rounded-lg ${
                          action.color === 'primary'
                            ? 'bg-primary-100 text-primary-600'
                            : action.color === 'accent'
                              ? 'bg-accent-100 text-accent-600'
                              : 'bg-secondary-100 text-secondary-600'
                        }`}
                      >
                        {action.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {action.title}
                        </h3>
                        <p className="text-sm text-slate-600 mt-1">
                          {action.description}
                        </p>
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Recent activity */}
          <motion.div variants={itemVariants}>
            <ChartContainer
              title="Actividad Reciente"
              subtitle="Últimas acciones en tu árbol"
            >
              <div className="space-y-4">
                {[
                  'Agregaste a María García',
                  'Subiste 3 fotografías nuevas',
                  'Registraste el cumpleaños de Juan',
                ].map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <div className="w-2 h-2 rounded-full bg-primary-600" />
                    <p className="text-slate-700">{activity}</p>
                    <span className="ml-auto text-xs text-slate-500">
                      Hace 2 días
                    </span>
                  </div>
                ))}
              </div>
            </ChartContainer>
          </motion.div>
        </>
      )}

      {/* CTA Section */}
      {!isEmpty && (
        <motion.div variants={itemVariants} className="mt-12">
          <Card className="bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200">
            <CardBody className="py-8 px-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-2xl font-bold text-primary-900">
                    Comparte tu árbol con tu familia
                  </h3>
                  <p className="text-primary-700 mt-2">
                    Invita a otros miembros para colaborar y enriquecer el árbol genealógico
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={onAddFamily}
                >
                  Compartir ahora
                </Button>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};

PremiumHome.displayName = 'PremiumHome';
