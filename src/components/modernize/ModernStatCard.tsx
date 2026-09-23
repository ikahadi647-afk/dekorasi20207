import React from 'react';
import ModernBadge from './ModernBadge';

export interface ModernStatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
  change?: string;
  changeType?: 'increase' | 'decrease';
  iconColorVariant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  onClick?: () => void;
  className?: string;
}

const iconVariants = {
  primary: 'bg-[#ECF2FF] text-[#5D87FF]',
  secondary: 'bg-[#E8F7FF] text-[#49BEFF]',
  success: 'bg-[#E6FFFA] text-[#13DEB9]',
  warning: 'bg-[#FEF5E5] text-[#FFAE1F]',
  error: 'bg-[#FDEDE8] text-[#FA896B]',
};

/**
 * Modernize StatCard Component
 * Replicates the clean metric cards of Modernize:
 * Crisp white card, subtle 1px border, soft colored icon pill, bold display font, and change badge.
 */
export const ModernStatCard: React.FC<ModernStatCardProps> = ({
  title,
  value,
  icon,
  subtitle,
  change,
  changeType = 'increase',
  iconColorVariant = 'primary',
  onClick,
  className = '',
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        relative
        bg-white
        rounded-2xl
        border border-[#EAEFF4]
        p-5 sm:p-6
        shadow-[0_9px_17.5px_rgba(0,0,0,0.05)]
        hover:shadow-md
        transition-all duration-200
        ${onClick ? 'cursor-pointer' : ''}
        flex flex-col justify-between
        ${className}
      `}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div
          className={`
            w-12 h-12
            rounded-xl
            flex items-center justify-center
            flex-shrink-0
            ${iconVariants[iconColorVariant] || iconVariants.primary}
            transition-transform duration-200
            hover:scale-105
          `}
        >
          {icon}
        </div>

        {change && (
          <ModernBadge
            variant={changeType === 'increase' ? 'success' : 'error'}
            size="sm"
          >
            {changeType === 'increase' ? '+' : '-'}{change}
          </ModernBadge>
        )}
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[#5A6A85] mb-1">
          {title}
        </p>
        <h4 className="text-xl sm:text-2xl font-extrabold text-[#2A3547] tracking-tight leading-tight">
          {value}
        </h4>
        {subtitle && (
          <p className="text-xs text-[#5A6A85] mt-1.5 leading-relaxed font-normal">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default ModernStatCard;
