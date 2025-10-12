import React from 'react';
import { Check } from 'lucide-react';

interface Template {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  characteristics: string[];
  useCases: string[];
  tone: 'professional' | 'casual' | 'friendly' | 'authoritative' | 'empathetic';
}

interface TemplateCardProps {
  template: Template;
  isSelected: boolean;
  onSelect: () => void;
}

export default function TemplateCard({ template, isSelected, onSelect }: TemplateCardProps) {
  const getColorClasses = (color: string) => {
    return {
      border: isSelected ? 'border-phi-light' : 'border-phi-gray',
      bg: isSelected ? 'bg-phi-gray/30' : 'bg-phi-gray/20',
      text: 'text-phi-white',
      button: isSelected ? 'bg-phi-light text-phi-black' : 'bg-phi-gray/30 text-phi-white hover:bg-phi-gray/50'
    };
  };

  const colorClasses = getColorClasses(template.color);

  return (
    <div
      className={`
        relative p-2 rounded-lg border-2 transition-all duration-200 cursor-pointer
        ${colorClasses.border} ${colorClasses.bg}
        ${isSelected ? 'ring-2 ring-opacity-50 scale-105' : 'hover:scale-102'}
        group
      `}
      onClick={onSelect}
    >
      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-phi-light rounded-full flex items-center justify-center">
          <Check className="w-3 h-3 text-phi-black" />
        </div>
      )}

      {/* Template Icon and Name */}
      <div className="flex flex-col items-center text-center mb-2">
        <div className="text-2xl mb-1">
          {template.icon}
        </div>
        <h3 className="text-phi-white font-semibold text-xs">
          {template.name}
        </h3>
      </div>

      {/* Select Button */}
      <button
        className={`
          w-full py-1 px-2 rounded text-xs font-medium transition-all duration-200
          ${colorClasses.button}
          ${isSelected ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}
        `}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        {isSelected ? 'Selected' : 'Select'}
      </button>

      {/* Hover Effect */}
      <div className="absolute inset-0 rounded-lg bg-phi-light/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
    </div>
  );
}
