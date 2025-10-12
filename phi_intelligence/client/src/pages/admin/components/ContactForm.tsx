import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Building, Mail, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ContactFormData {
  status: string;
  priority: string;
  source: string;
  notes: string;
  assignedTo: string;
  lastContactedAt?: string;
}

interface ContactFormProps {
  contact: {
    id: string;
    name: string;
    email: string;
    company?: string;
    service?: string;
    message: string;
    status: string;
    priority: string;
    source: string;
    notes?: string;
    assignedTo?: string;
    lastContactedAt?: string;
    createdAt: string;
  };
  onSubmit: (data: ContactFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const contactStatuses = [
  { value: 'new', label: 'New', color: 'bg-blue-500/20 text-blue-300' },
  { value: 'contacted', label: 'Contacted', color: 'bg-yellow-500/20 text-yellow-300' },
  { value: 'qualified', label: 'Qualified', color: 'bg-green-500/20 text-green-300' },
  { value: 'converted', label: 'Converted', color: 'bg-purple-500/20 text-purple-300' },
  { value: 'lost', label: 'Lost', color: 'bg-red-500/20 text-red-300' }
];

const priorities = [
  { value: 'low', label: 'Low', color: 'bg-gray-500/20 text-gray-300' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500/20 text-yellow-300' },
  { value: 'high', label: 'High', color: 'bg-red-500/20 text-red-300' }
];

const sources = [
  { value: 'contact_form', label: 'Contact Form' },
  { value: 'career_page', label: 'Career Page' },
  { value: 'referral', label: 'Referral' },
  { value: 'other', label: 'Other' }
];

const teamMembers = [
  'admin',
  'sales',
  'marketing',
  'support'
];

export default function ContactForm({ contact, onSubmit, onCancel, isLoading = false }: ContactFormProps) {
  const [formData, setFormData] = useState<ContactFormData>({
    status: contact.status || 'new',
    priority: contact.priority || 'medium',
    source: contact.source || 'contact_form',
    notes: contact.notes || '',
    assignedTo: contact.assignedTo || '',
    lastContactedAt: contact.lastContactedAt || ''
  });

  const [errors, setErrors] = useState<Partial<ContactFormData>>({});

  useEffect(() => {
    setFormData({
      status: contact.status || 'new',
      priority: contact.priority || 'medium',
      source: contact.source || 'contact_form',
      notes: contact.notes || '',
      assignedTo: contact.assignedTo || '',
      lastContactedAt: contact.lastContactedAt || ''
    });
  }, [contact]);

  const validateForm = (): boolean => {
    const newErrors: Partial<ContactFormData> = {};

    if (!formData.status) {
      newErrors.status = 'Status is required';
    }
    if (!formData.priority) {
      newErrors.priority = 'Priority is required';
    }
    if (!formData.source) {
      newErrors.source = 'Source is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    if (!status) return 'bg-gray-500/20 text-gray-300';
    return contactStatuses.find(s => s.value === status)?.color || 'bg-gray-500/20 text-gray-300';
  };

  const getPriorityColor = (priority: string) => {
    if (!priority) return 'bg-gray-500/20 text-gray-300';
    return priorities.find(p => p.value === priority)?.color || 'bg-gray-500/20 text-gray-300';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card border border-border rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-white">Edit Contact</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="text-muted-foreground hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Contact Information Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-muted/20 rounded-lg border border-border/50">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Name:</span>
                <span className="font-medium text-white">{contact.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Email:</span>
                <span className="font-medium text-white">{contact.email}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Company:</span>
                <span className="font-medium text-white">{contact.company || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Created:</span>
                <span className="font-medium text-white">{formatDate(contact.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Message Display */}
          <div className="space-y-2">
            <Label className="text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Original Message
            </Label>
            <div className="p-3 bg-muted/20 rounded border border-border/50 text-white">
              {contact.message}
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status" className="text-white">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger className="bg-black border-border/50 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-white">
                  {contactStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value} className="hover:bg-accent">
                      <span className={`inline-block w-2 h-2 rounded-full mr-2 ${status.color.split(' ')[0]}`}></span>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-red-400 text-sm">{errors.status}</p>
              )}
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="priority" className="text-white">Priority *</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger className="bg-black border-border/50 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-white">
                  {priorities.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value} className="hover:bg-accent">
                      <span className={`inline-block w-2 h-2 rounded-full mr-2 ${priority.color.split(' ')[0]}`}></span>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.priority && (
                <p className="text-red-400 text-sm">{errors.priority}</p>
              )}
            </div>

            {/* Source */}
            <div className="space-y-2">
              <Label htmlFor="source" className="text-white">Source *</Label>
              <Select
                value={formData.source}
                onValueChange={(value) => setFormData(prev => ({ ...prev, source: value }))}
              >
                <SelectTrigger className="bg-black border-border/50 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-white">
                  {sources.map((source) => (
                    <SelectItem key={source.value} value={source.value} className="hover:bg-accent">
                      {source.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.source && (
                <p className="text-red-400 text-sm">{errors.source}</p>
              )}
            </div>

            {/* Assigned To */}
            <div className="space-y-2">
              <Label htmlFor="assignedTo" className="text-white">Assigned To</Label>
              <Select
                value={formData.assignedTo || "unassigned"}
                onValueChange={(value) => setFormData(prev => ({ ...prev, assignedTo: value === "unassigned" ? "" : value }))}
              >
                <SelectTrigger className="bg-black border-border/50 text-white">
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-white">
                  <SelectItem value="unassigned" className="hover:bg-accent">Unassigned</SelectItem>
                  {teamMembers.map((member) => (
                    <SelectItem key={member} value={member} className="hover:bg-accent capitalize">
                      {member}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Last Contacted Date */}
          <div className="space-y-2">
            <Label htmlFor="lastContactedAt" className="text-white">Last Contacted</Label>
            <Input
              type="datetime-local"
              id="lastContactedAt"
              value={formData.lastContactedAt || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, lastContactedAt: e.target.value }))}
              className="bg-black border-border/50 text-white"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-white">Internal Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Add internal notes about this contact..."
              rows={4}
              className="bg-black border-border/50 text-white placeholder:text-gray-500 resize-none"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="border-border/50 text-white hover:bg-accent"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isLoading ? 'Updating...' : 'Update Contact'}
            </Button>
          </div>
        </div>

        {/* Hidden form for submission */}
        <form onSubmit={handleSubmit} className="hidden">
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
}
