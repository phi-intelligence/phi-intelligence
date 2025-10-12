import React from 'react';
import TemplateCard from './TemplateCard';

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

interface PersonalityTemplatesProps {
  selectedTemplate: number | null;
  onTemplateSelect: (templateId: number) => void;
}

const templates: Template[] = [
  {
    id: 1,
    name: "Professional",
    description: "Business-focused, formal tone",
    icon: "◼",
    color: "blue",
    characteristics: ["Formal", "Precise", "Business-oriented", "Respectful"],
    useCases: ["Corporate", "Customer Service", "Sales", "Consulting"],
    tone: "professional"
  },
  {
    id: 2,
    name: "Friendly",
    description: "Casual, warm, approachable",
    icon: "◯",
    color: "green",
    characteristics: ["Warm", "Approachable", "Conversational", "Welcoming"],
    useCases: ["Personal Assistant", "Customer Support", "Education", "Healthcare"],
    tone: "friendly"
  },
  {
    id: 3,
    name: "Technical",
    description: "Expert, precise, detailed",
    icon: "◢",
    color: "purple",
    characteristics: ["Expert", "Detailed", "Analytical", "Precise"],
    useCases: ["IT Support", "Technical Documentation", "Engineering", "Research"],
    tone: "authoritative"
  },
  {
    id: 4,
    name: "Sales",
    description: "Persuasive, confident, engaging",
    icon: "◈",
    color: "orange",
    characteristics: ["Persuasive", "Confident", "Engaging", "Motivational"],
    useCases: ["Sales", "Marketing", "Lead Generation", "Product Demos"],
    tone: "authoritative"
  },
  {
    id: 5,
    name: "Empathetic",
    description: "Caring, understanding, supportive",
    icon: "◐",
    color: "pink",
    characteristics: ["Caring", "Understanding", "Supportive", "Patient"],
    useCases: ["Healthcare", "Counseling", "Mental Health", "Social Work"],
    tone: "empathetic"
  },
  {
    id: 6,
    name: "Educational",
    description: "Teaching, informative, patient",
    icon: "◊",
    color: "indigo",
    characteristics: ["Educational", "Patient", "Clear", "Encouraging"],
    useCases: ["E-learning", "Training", "Tutoring", "Documentation"],
    tone: "friendly"
  }
];

export default function PersonalityTemplates({ selectedTemplate, onTemplateSelect }: PersonalityTemplatesProps) {
  // Show all templates in single column layout
  const displayTemplates = templates;
  
  return (
    <div className="space-y-3">
      {/* Template List - One per row */}
      <div className="space-y-2">
        {displayTemplates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            isSelected={selectedTemplate === template.id}
            onSelect={() => onTemplateSelect(template.id)}
          />
        ))}
      </div>

      {/* Selected Template Details */}
      {selectedTemplate && (
        <div className="mt-3 p-3 bg-phi-gray/30 rounded-lg">
          {(() => {
            const selectedTemplateData = displayTemplates.find(t => t.id === selectedTemplate);
            return selectedTemplateData ? (
              <div>
                <h4 className="text-phi-white font-semibold mb-1 flex items-center gap-2 text-sm">
                  <span className="text-lg">{selectedTemplateData.icon}</span>
                  {selectedTemplateData.name}
                </h4>
                <p className="text-phi-gray text-xs mb-2">
                  {selectedTemplateData.description}
                </p>
                
                {/* Characteristics */}
                <div className="mb-2">
                  <h5 className="text-phi-white text-xs font-semibold mb-1">Characteristics:</h5>
                  <div className="flex flex-wrap gap-1">
                    {selectedTemplateData.characteristics.slice(0, 2).map((char, index) => (
                      <span
                        key={index}
                        className="px-1 py-0.5 bg-phi-light/20 text-phi-light text-xs rounded"
                      >
                        {char}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : null;
          })()}
        </div>
      )}

      {/* Instructions */}
      <div className="text-center text-phi-gray text-xs">
        <p>Choose a personality that matches your use case</p>
      </div>
    </div>
  );
}
