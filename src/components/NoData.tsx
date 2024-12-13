import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import React from 'react';

export enum Type {
  danger = 'danger',
  success = 'success',
  warning = 'warning',
  info = 'info',
}

interface NoDataProps {
  className?: string;
  text: string;
  type: Type;
}

const typeStyles = {
  [Type.danger]: 'bg-red-50 border-red-300 text-red-800',
  [Type.success]: 'bg-green-50 border-green-300 text-green-800',
  [Type.warning]: 'bg-yellow-50 border-yellow-300 text-yellow-800',
  [Type.info]: 'bg-blue-50 border-blue-300 text-blue-800',
};

const iconMap = {
  [Type.danger]: XCircle,
  [Type.success]: CheckCircle,
  [Type.warning]: AlertTriangle,
  [Type.info]: Info,
};

const NoData: React.FC<NoDataProps> = ({ className, text, type }) => {
  const IconComponent = iconMap[type];

  return (
    <div
      className={cn(
        `px-6 py-4 border rounded-lg shadow-sm flex items-center align-middle justify-center`,
        typeStyles[type],
        className,
      )}
    >
      <div className="mr-4">
        <IconComponent className="w-6 h-6" />
      </div>
      <span className="font-medium">{text}</span>
    </div>
  );
};

export default NoData;
