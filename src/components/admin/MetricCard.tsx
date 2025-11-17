/**
 * MetricCard Component
 * Displays a metric with icon, value, title, and trend indicator
 * Uses Liquid Glass design with Arabic RTL support
 */

import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: 'up' | 'down';
  changePercentage?: number;
  gradient?: string;
  subtitle?: string;
  format?: 'number' | 'currency';
}

export default function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  changePercentage,
  gradient = 'from-[#4091A5] to-[#535353]',
  subtitle,
  format = 'number',
}: MetricCardProps) {
  const formatValue = (val: number | string): string => {
    if (typeof val === 'string') return val;

    if (format === 'currency') {
      return val.toLocaleString('ar-SA', {
        style: 'currency',
        currency: 'SAR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
    }

    return val.toLocaleString('ar-EG');
  };

  return (
    <div className="group relative" dir="rtl">
      {/* Glow Effect */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity`}
      />

      {/* Glass Card */}
      <div className="relative bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
        {/* Header with Icon */}
        <div className="flex items-start justify-between mb-4">
          <div className={`bg-gradient-to-br ${gradient} p-3 rounded-xl shadow-lg`}>
            <Icon className="h-6 w-6 text-white" />
          </div>

          {/* Trend Indicator */}
          {trend && changePercentage !== undefined && (
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
                trend === 'up'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {trend === 'up' ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span style={{ fontFamily: 'Tajawal' }}>
                {changePercentage.toFixed(1)}%
              </span>
            </div>
          )}
        </div>

        {/* Title */}
        <h3
          className="text-slate-600 text-sm mb-1 text-right"
          style={{ fontFamily: 'Tajawal' }}
        >
          {title}
        </h3>

        {/* Value */}
        <p
          className="text-3xl font-bold text-slate-900 text-right mb-2"
          style={{ fontFamily: 'Tajawal' }}
        >
          {formatValue(value)}
        </p>

        {/* Subtitle */}
        {subtitle && (
          <p
            className="text-xs text-slate-500 text-right"
            style={{ fontFamily: 'Tajawal' }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
