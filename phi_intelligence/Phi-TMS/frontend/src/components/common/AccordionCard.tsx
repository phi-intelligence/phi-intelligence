import { useState, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';

interface AccordionCardProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

const AccordionCard = ({ title, children, defaultOpen = false, className }: AccordionCardProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={cn('card', className)}>
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-2"
      >
        <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
        <ChevronDown
          className={cn('w-5 h-5 text-text-secondary transition-transform duration-200', {
            'transform rotate-180': isOpen,
          })}
        />
      </button>

      {/* Content */}
      <div
        className={cn('overflow-hidden transition-all duration-300', {
          'max-h-0': !isOpen,
          'max-h-[2000px] mt-4': isOpen,
        })}
      >
        {children}
      </div>
    </div>
  );
};

export default AccordionCard;

