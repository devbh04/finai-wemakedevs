"use client";

import React from "react";
import { motion } from "framer-motion";
import MarkdownRenderer from "./MarkdownRenderer";
import MetricCard from "./MetricCard";
import StatusBadge from "./StatusBadge";
import ComplianceChecker from "./ComplianceChecker";
import Timeline from "./Timeline";
import EnhancedTable from "./EnhancedTable";
import {
  FileText,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Calendar,
  DollarSign,
  Percent,
  Users,
  Building2,
  Briefcase,
} from "lucide-react";

interface ReportDisplayProps {
  content: string;
  reportType: "salaried" | "business" | "self-employed";
  generatedDate?: string;
}

export default function ReportDisplay({
  content,
  reportType,
  generatedDate,
}: ReportDisplayProps) {
  // Extract key metrics from content
  const extractKeyMetrics = (
    text: string
  ): Array<{
    title: string;
    value: string;
    color: "green" | "red" | "amber" | "blue";
    type: "percentage" | "currency";
  }> => {
    const metrics: Array<{
      title: string;
      value: string;
      color: "green" | "red" | "amber" | "blue";
      type: "percentage" | "currency";
    }> = [];

    // Common patterns for different report types
    const patterns = {
      totalIncome: /Total.*Income.*₹([\d,]+)/i,
      taxLiability: /Tax.*Liability.*₹([\d,]+)/i,
      netProfit: /Net.*Profit.*₹([\d,]+)/i,
      profitMargin: /Profit.*Margin.*?([\d.]+)%/i,
      revenue: /Revenue.*₹([\d,]+)/i,
      savings: /Savings.*₹([\d,]+)/i,
    };

    Object.entries(patterns).forEach(([key, pattern]) => {
      const match = text.match(pattern);
      if (match) {
        let title = key
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase());
        let value = key.includes("Margin") ? `${match[1]}%` : `₹${match[1]}`;
        let color: "green" | "red" | "amber" | "blue" = "blue";

        if (
          key.includes("profit") ||
          key.includes("income") ||
          key.includes("revenue")
        ) {
          color = "green";
        } else if (key.includes("tax")) {
          color = "red";
        } else if (key.includes("margin")) {
          color = "blue";
        }

        metrics.push({
          title,
          value,
          color,
          type: key.includes("Margin") ? "percentage" : "currency",
        });
      }
    });

    return metrics.slice(0, 4);
  };

  // Extract compliance information
  const extractCompliance = (text: string) => {
    const items = [];

    // GST Compliance
    if (text.toLowerCase().includes("gst")) {
      const isCompliant =
        text.toLowerCase().includes("gst") &&
        (text.toLowerCase().includes("filed") ||
          text.toLowerCase().includes("compliant"));
      items.push({
        title: "GST Compliance",
        status: isCompliant ? ("compliant" as const) : ("pending" as const),
        description: "GST return filing and payment status",
      });
    }

    // Income Tax
    if (
      text.toLowerCase().includes("income tax") ||
      text.toLowerCase().includes("itr")
    ) {
      const isCompliant =
        text.toLowerCase().includes("filed") ||
        text.toLowerCase().includes("submitted");
      items.push({
        title: "Income Tax Filing",
        status: isCompliant ? ("compliant" as const) : ("pending" as const),
        description: "Annual income tax return filing status",
      });
    }

    // TDS/Advance Tax
    if (
      text.toLowerCase().includes("tds") ||
      text.toLowerCase().includes("advance tax")
    ) {
      items.push({
        title: "Tax Deductions",
        status: "partial" as const,
        description: "TDS and advance tax compliance",
      });
    }

    // Audit Requirements
    if (text.toLowerCase().includes("audit")) {
      items.push({
        title: "Audit Requirements",
        status: "pending" as const,
        description: "Statutory audit compliance",
      });
    }

    return items;
  };

  // Extract timeline/important dates
  const extractTimeline = (text: string) => {
    const items = [];
    const currentYear = new Date().getFullYear();

    // Common due dates
    const dueDates = [
      {
        title: "ITR Filing Due",
        date: "31 July 2024",
        status: "upcoming" as const,
      },
      {
        title: "Advance Tax Q1",
        date: "15 June 2024",
        status: "pending" as const,
      },
      {
        title: "GST Return Q4",
        date: "20 January 2024",
        status: "overdue" as const,
      },
      {
        title: "TDS Return Filing",
        date: "31 March 2024",
        status: "completed" as const,
      },
    ];

    return dueDates.slice(0, 4);
  };

  const getReportIcon = () => {
    switch (reportType) {
      case "salaried":
        return <Users className="w-8 h-8" />;
      case "business":
        return <Building2 className="w-8 h-8" />;
      case "self-employed":
        return <Briefcase className="w-8 h-8" />;
      default:
        return <FileText className="w-8 h-8" />;
    }
  };

  const getReportTitle = () => {
    switch (reportType) {
      case "salaried":
        return "Salaried Individual Analysis";
      case "business":
        return "Business Financial Analysis";
      case "self-employed":
        return "Self-Employed Professional Analysis";
      default:
        return "Financial Analysis Report";
    }
  };

  const metrics = extractKeyMetrics(content);
  const complianceItems = extractCompliance(content);
  const timelineItems = extractTimeline(content);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Report Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="bg-white rounded-xl shadow-lg border border-amber-200 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-6">
            <div className="flex items-center space-x-3">
              <FileText className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Detailed Analysis Report</h2>
                <p className="text-amber-100 mt-1">
                  Comprehensive financial analysis and recommendations
                </p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <MarkdownRenderer content={content} reportType={reportType} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
