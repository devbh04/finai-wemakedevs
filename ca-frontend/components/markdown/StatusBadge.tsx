"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, Clock, XCircle, Info } from 'lucide-react';

interface StatusBadgeProps {
  status: 'success' | 'warning' | 'error' | 'info' | 'pending';
  text: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function StatusBadge({ status, text, size = 'md' }: StatusBadgeProps) {
  const statusConfig = {
    success: {
      icon: CheckCircle,
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-200',
      iconColor: 'text-green-600'
    },
    warning: {
      icon: AlertTriangle,
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-200',
      iconColor: 'text-yellow-600'
    },
    error: {
      icon: XCircle,
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-200',
      iconColor: 'text-red-600'
    },
    info: {
      icon: Info,
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      border: 'border-blue-200',
      iconColor: 'text-blue-600'
    },
    pending: {
      icon: Clock,
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      border: 'border-gray-200',
      iconColor: 'text-gray-600'
    }
  };

  const sizeConfig = {
    sm: {
      padding: 'px-2 py-1',
      text: 'text-xs',
      icon: 'w-3 h-3'
    },
    md: {
      padding: 'px-3 py-2',
      text: 'text-sm',
      icon: 'w-4 h-4'
    },
    lg: {
      padding: 'px-4 py-3',
      text: 'text-base',
      icon: 'w-5 h-5'
    }
  };

  const config = statusConfig[status];
  const sizeStyles = sizeConfig[size];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`
        inline-flex items-center space-x-2 rounded-full border font-medium
        ${config.bg} ${config.text} ${config.border} ${sizeStyles.padding}
      `}
    >
      <Icon className={`${config.iconColor} ${sizeStyles.icon}`} />
      <span className={sizeStyles.text}>{text}</span>
    </motion.div>
  );
}