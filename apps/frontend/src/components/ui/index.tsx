import React, { ReactNode } from 'react';
import './styles.css';

// Card Component
interface CardProps {
  size?: 'sm' | 'md' | 'lg';
  status?: { text: string; icon: string };
  children: ReactNode;
}

export const Card: React.FC<CardProps> = ({ size = 'md', status, children }) => (
  <div className={`card card-${size}`}>
    {status && (
      <div className="card-status">
        <span className="status-icon">{status.icon === 'globe' ? '🌐' : '📍'}</span>
        <span className="status-text">{status.text}</span>
      </div>
    )}
    {children}
  </div>
);

// Layout Components
interface ColProps {
  gap?: number;
  children: ReactNode;
}

export const Col: React.FC<ColProps> = ({ gap = 0, children }) => (
  <div className="col" style={{ gap: `${gap * 0.25}rem` }}>
    {children}
  </div>
);

interface RowProps {
  gap?: number;
  padding?: { y?: number; x?: number };
  background?: string;
  radius?: string;
  border?: { size: number };
  children: ReactNode;
}

export const Row: React.FC<RowProps> = ({ gap = 0, padding, background, radius, border, children }) => (
  <div
    className="row"
    style={{
      gap: `${gap * 0.25}rem`,
      paddingTop: padding?.y ? `${padding.y * 0.25}rem` : undefined,
      paddingBottom: padding?.y ? `${padding.y * 0.25}rem` : undefined,
      paddingLeft: padding?.x ? `${padding.x * 0.25}rem` : undefined,
      paddingRight: padding?.x ? `${padding.x * 0.25}rem` : undefined,
      backgroundColor: background,
      borderRadius: radius === 'sm' ? '0.375rem' : undefined,
      border: border ? `${border.size}px solid #e5e7eb` : undefined,
    }}
  >
    {children}
  </div>
);

export const Spacer: React.FC = () => <div style={{ flex: 1 }} />;

export const Divider: React.FC = () => <hr className="divider" />;

// Typography Components
interface TitleProps {
  value: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Title: React.FC<TitleProps> = ({ value, size = 'md' }) => (
  <h2 className={`title title-${size}`}>{value}</h2>
);

interface TextProps {
  value: string;
  size?: 'sm' | 'md' | 'lg';
  weight?: 'normal' | 'semibold' | 'bold';
  color?: string;
}

export const Text: React.FC<TextProps> = ({ value, size = 'md', weight = 'normal', color }) => (
  <span className={`text text-${size} text-${weight}`} style={{ color }}>
    {value}
  </span>
);

interface CaptionProps {
  value: string;
  color?: string;
}

export const Caption: React.FC<CaptionProps> = ({ value, color }) => (
  <p className="caption" style={{ color: color === 'secondary' ? '#6b7280' : color }}>
    {value}
  </p>
);

// Form Components
interface SelectProps {
  name: string;
  options: Array<{ label: string; value: string }>;
  defaultValue?: string;
  variant?: 'default' | 'ghost';
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const Select: React.FC<SelectProps> = ({ name, options, defaultValue, variant = 'default', onChange }) => (
  <select name={name} defaultValue={defaultValue} className={`select select-${variant}`} onChange={onChange}>
    {options.map((opt) => (
      <option key={opt.value} value={opt.value}>
        {opt.label}
      </option>
    ))}
  </select>
);

interface ButtonProps {
  label: string;
  variant?: 'default' | 'outline';
  style?: 'primary' | 'secondary';
  iconStart?: string;
  submit?: boolean;
  onClick?: () => void;
}

const iconMap: Record<string, string> = {
  'circle-question': '❓',
  'write-alt': '✍️',
  'chevron-left': '◀',
  mail: '📧',
  'notebook-pencil': '📝',
  lightbulb: '💡',
  'book-open': '📖',
  reload: '🔄',
  info: 'ℹ️',
  'external-link': '🔗',
};

export const Button: React.FC<ButtonProps> = ({ label, variant = 'default', style, iconStart, submit, onClick }) => (
  <button
    type={submit ? 'submit' : 'button'}
    className={`button button-${variant} ${style ? `button-${style}` : ''}`}
    onClick={onClick}
  >
    {iconStart && <span className="button-icon">{iconMap[iconStart] || '•'}</span>}
    {label}
  </button>
);

interface FormProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
}

export const Form: React.FC<FormProps> = ({ onSubmit, children }) => (
  <form onSubmit={onSubmit} className="form">
    {children}
  </form>
);

interface TextareaProps {
  name: string;
  placeholder?: string;
  required?: boolean;
  rows?: number;
}

export const Textarea: React.FC<TextareaProps> = ({ name, placeholder, required, rows = 3 }) => (
  <textarea name={name} placeholder={placeholder} required={required} rows={rows} className="textarea" />
);

interface CheckboxProps {
  name: string;
  label: string;
  defaultChecked?: boolean;
}

export const Checkbox: React.FC<CheckboxProps> = ({ name, label, defaultChecked }) => (
  <label className="checkbox-label">
    <input type="checkbox" name={name} defaultChecked={defaultChecked} className="checkbox" />
    <span>{label}</span>
  </label>
);

// Badge Component
interface BadgeProps {
  label: string;
  color?: 'success' | 'warning' | 'error';
}

export const Badge: React.FC<BadgeProps> = ({ label, color = 'success' }) => (
  <span className={`badge badge-${color}`}>{label}</span>
);

// Icon Component
interface IconProps {
  name: string;
}

export const Icon: React.FC<IconProps> = ({ name }) => (
  <span className="icon">{iconMap[name] || '•'}</span>
);

// Chart Component
interface ChartProps {
  data: Array<Record<string, any>>;
  series: Array<{ type: string; dataKey: string; label: string; color: string }>;
  xAxis: { dataKey: string };
  showYAxis?: boolean;
}

export const Chart: React.FC<ChartProps> = ({ data, series, xAxis }) => {
  const maxValue = Math.max(...data.map((d) => d[series[0].dataKey]));

  return (
    <div className="chart">
      <div className="chart-bars">
        {data.map((item, idx) => {
          const value = item[series[0].dataKey];
          const height = (value / maxValue) * 100;
          return (
            <div key={idx} className="chart-bar-container">
              <div className="chart-bar" style={{ height: `${height}%`, backgroundColor: '#f97316' }}>
                <span className="chart-value">{value}%</span>
              </div>
              <span className="chart-label">{item[xAxis.dataKey]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
