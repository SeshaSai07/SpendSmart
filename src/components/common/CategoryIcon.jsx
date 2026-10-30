import React from 'react';
import {
  Utensils,
  Car,
  ShoppingBag,
  Zap,
  Film,
  HeartPulse,
  GraduationCap,
  Plane,
  Home,
  Briefcase,
  Laptop,
  TrendingUp,
  Coins,
  Gift,
  MoreHorizontal,
  Tag,
  CircleDollarSign,
} from 'lucide-react';

const iconMap = {
  Utensils,
  Car,
  ShoppingBag,
  Zap,
  Film,
  HeartPulse,
  GraduationCap,
  Plane,
  Home,
  Briefcase,
  Laptop,
  TrendingUp,
  Coins,
  Gift,
  MoreHorizontal,
  Tag,
  CircleDollarSign,
};

export function CategoryIcon({ name, className = 'w-4 h-4' }) {
  const IconComponent = iconMap[name] || Tag;
  return <IconComponent className={className} />;
}

