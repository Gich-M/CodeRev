import React from 'react';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

export type Status = 'pending' | 'completed' | 'approved' | 'changes_requested' | string;

interface StatusBadgeProps {
  status: Status;
}

const STATUS_CONFIG: Record<string, {
  icon: React.ElementType;
  text: string;
  className: string;
}> = {
  pending: {
    icon: Clock,
    text: 'Pending Review',
    className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
  },
  completed: {
    icon: CheckCircle,
    text: 'Approved',
    className: 'bg-green-500/10 text-green-500 border-green-500/20'
  },
  approved: {
    icon: CheckCircle,
    text: 'Approved',
    className: 'bg-green-500/10 text-green-500 border-green-500/20'
  },
  changes_requested: {
    icon: XCircle,
    text: 'Changes Requested',
    className: 'bg-red-500/10 text-red-500 border-red-500/20'
  }
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase().replace(/\s+/g, '_');
  const config = STATUS_CONFIG[normalizedStatus] || STATUS_CONFIG.pending;
  const Icon = config.icon;

  return (
    <div className={`flex items-center px-2.5 py-1 rounded-full border ${config.className}`}>
      <Icon className="w-3.5 h-3.5 mr-1" />
      <span className="text-xs font-medium">{config.text}</span>
    </div>
  );
} 