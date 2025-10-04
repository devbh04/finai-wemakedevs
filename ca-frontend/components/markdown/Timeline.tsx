"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface TimelineItemProps {
  title: string;
  date: string;
  status: 'completed' | 'pending' | 'overdue' | 'upcoming';
  description?: string;
  priority?: 'high' | 'medium' | 'low';
}

interface TimelineProps {
  items: TimelineItemProps[];
  title?: string;
}

export default function Timeline({ items, title = "Important Dates" }: TimelineProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bg: 'bg-green-100',
          border: 'border-green-300',
          line: 'bg-green-300'
        };
      case 'pending':
        return {
          icon: Clock,
          color: 'text-yellow-600',
          bg: 'bg-yellow-100',
          border: 'border-yellow-300',
          line: 'bg-yellow-300'
        };
      case 'overdue':
        return {
          icon: AlertTriangle,
          color: 'text-red-600',
          bg: 'bg-red-100',
          border: 'border-red-300',
          line: 'bg-red-300'
        };
      case 'upcoming':
        return {
          icon: Calendar,
          color: 'text-blue-600',
          bg: 'bg-blue-100',
          border: 'border-blue-300',
          line: 'bg-blue-300'
        };
      default:
        return {
          icon: Clock,
          color: 'text-gray-600',
          bg: 'bg-gray-100',
          border: 'border-gray-300',
          line: 'bg-gray-300'
        };
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
    >
      <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
        <Calendar className="w-5 h-5 text-amber-600" />
        <span>{title}</span>
      </h3>

      <div className="relative">
        {items.map((item, index) => {
          const config = getStatusConfig(item.status);
          const Icon = config.icon;
          const isLast = index === items.length - 1;
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative flex items-start space-x-4 pb-8 last:pb-0"
            >
              {/* Timeline line */}
              {!isLast && (
                <div className="absolute left-6 top-12 w-0.5 h-full bg-gray-200"></div>
              )}
              
              {/* Icon */}
              <div className={`
                relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2
                ${config.bg} ${config.border}
              `}>
                <Icon className={`w-5 h-5 ${config.color}`} />
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <h4 className="text-lg font-semibold text-gray-900">{item.title}</h4>
                    {item.priority && (
                      <div className={`w-2 h-2 rounded-full ${getPriorityColor(item.priority)}`}></div>
                    )}
                  </div>
                  <span className="text-sm text-gray-500 font-medium">{item.date}</span>
                </div>
                
                {item.description && (
                  <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
                )}
                
                <div className="mt-2">
                  <span className={`
                    inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${config.bg} ${config.color}
                  `}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}