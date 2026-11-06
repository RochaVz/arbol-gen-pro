import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardBody } from '../ui/CardV2';
import { cn } from '../../utils/cn';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: {
    value: number;
    direction: 'up' | 'down';
    period: string;
  };
  color?: 'primary' | 'secondary' | 'accent' | 'success';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  icon,
  label,
  value,
  trend,
  color = 'primary',
}) => {
  const colorStyles = {
    primary: 'bg-primary-50 text-primary-600',
    secondary: 'bg-secondary-50 text-secondary-600',
    accent: 'bg-accent-50 text-accent-600',
    success: 'bg-green-50 text-green-600',
  };

  const trendColorClass =
    trend?.direction === 'up'
      ? 'text-green-600 bg-green-50'
      : 'text-red-600 bg-red-50';

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="hover:shadow-lg transition-shadow">
        <CardBody className="space-y-4">
          <div className="flex items-start justify-between">
            <div className={cn('p-3 rounded-lg', colorStyles[color])}>
              {icon}
            </div>
            {trend && (
              <div
                className={cn(
                  'flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium',
                  trendColorClass
                )}
              >
                {trend.direction === 'up' ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
                <span>{trend.value}%</span>
              </div>
            )}
          </div>

          <div>
            <p className="text-sm text-slate-600 font-medium">{label}</p>
            <h3 className="text-3xl font-bold text-slate-900 mt-2">{value}</h3>
            {trend && (
              <p className="text-xs text-slate-500 mt-2">{trend.period}</p>
            )}
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

MetricCard.displayName = 'MetricCard';

interface DashboardGridProps {
  children: React.ReactNode;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({ children }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {children}
  </div>
);

DashboardGrid.displayName = 'DashboardGrid';

interface ChartContainerProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  subtitle,
  children,
  headerAction,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 }}
  >
    <Card>
      <div className="px-6 py-4 border-b border-slate-200">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            {subtitle && <p className="text-sm text-slate-600 mt-1">{subtitle}</p>}
          </div>
          {headerAction && <div className="flex-shrink-0">{headerAction}</div>}
        </div>
      </div>
      <CardBody>{children}</CardBody>
    </Card>
  </motion.div>
);

ChartContainer.displayName = 'ChartContainer';

interface StatBadgeProps {
  label: string;
  value: string | number;
  color?: 'primary' | 'secondary' | 'accent';
}

export const StatBadge: React.FC<StatBadgeProps> = ({
  label,
  value,
  color = 'primary',
}) => {
  const colorStyles = {
    primary: 'bg-primary-100 text-primary-900',
    secondary: 'bg-secondary-100 text-secondary-900',
    accent: 'bg-accent-100 text-accent-900',
  };

  return (
    <div className={cn('inline-block px-3 py-1.5 rounded-lg text-sm font-medium', colorStyles[color])}>
      <span className="text-xs opacity-75">{label}: </span>
      <span className="font-semibold">{value}</span>
    </div>
  );
};

StatBadge.displayName = 'StatBadge';
