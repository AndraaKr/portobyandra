import React from 'react';
import {
  Film,
  Video,
  Play,
  Sparkles,
  Layers,
  Scissors,
  TrendingUp,
  BarChart2,
  Search,
  FileText,
  Cpu,
  Bot,
  Layout,
  Code2,
  CheckCircle2,
} from 'lucide-react';

interface SkillIconProps {
  name: string;
  className?: string;
}

export const SkillIcon: React.FC<SkillIconProps> = ({ name, className = 'w-3.5 h-3.5' }) => {
  const lower = name.toLowerCase();

  if (lower.includes('chatgpt') || lower.includes('claude') || lower.includes('bot')) {
    return <Bot className={`${className} text-ink shrink-0`} />;
  }
  if (lower.includes('midjourney') || lower.includes('after effects') || lower.includes('motion') || lower.includes('animasi')) {
    return <Sparkles className={`${className} text-ink shrink-0`} />;
  }
  if (lower.includes('premiere') || lower.includes('film') || lower.includes('runway') || lower.includes('video')) {
    return <Film className={`${className} text-ink shrink-0`} />;
  }
  if (lower.includes('davinci') || lower.includes('color') || lower.includes('grade') || lower.includes('elevenlabs')) {
    return <Play className={`${className} text-ink shrink-0`} />;
  }
  if (lower.includes('capcut') || lower.includes('potong') || lower.includes('short')) {
    return <Scissors className={`${className} text-ink shrink-0`} />;
  }
  if (lower.includes('marketing') || lower.includes('growth') || lower.includes('campaign')) {
    return <TrendingUp className={`${className} text-ink shrink-0`} />;
  }
  if (lower.includes('ads') || lower.includes('analitik') || lower.includes('meta') || lower.includes('insight')) {
    return <BarChart2 className={`${className} text-ink shrink-0`} />;
  }
  if (lower.includes('seo') || lower.includes('search')) {
    return <Search className={`${className} text-ink shrink-0`} />;
  }
  if (lower.includes('konten') || lower.includes('copy') || lower.includes('writing') || lower.includes('strategy')) {
    return <FileText className={`${className} text-ink shrink-0`} />;
  }
  if (lower.includes('ai') || lower.includes('generative')) {
    return <Cpu className={`${className} text-ink shrink-0`} />;
  }
  if (lower.includes('figma') || lower.includes('ui') || lower.includes('ux') || lower.includes('design system')) {
    return <Layout className={`${className} text-ink shrink-0`} />;
  }
  if (lower.includes('react') || lower.includes('typescript') || lower.includes('tailwind') || lower.includes('code') || lower.includes('frontend')) {
    return <Code2 className={`${className} text-ink shrink-0`} />;
  }

  return <CheckCircle2 className={`${className} text-ink-2 shrink-0`} />;
};
