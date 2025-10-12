import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface JobFormData {
  title: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
  isActive: boolean;
}

interface JobFormProps {
  job?: JobFormData;
  onSubmit: (data: JobFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const jobTypes = [
  'Full Time',
  'Part Time',
  'Contract',
  'Internship',
  'Freelance'
];

export default function JobForm({ job, onSubmit, onCancel, isLoading = false }: JobFormProps) {
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    location: '',
    type: 'Full Time',
    description: '',
    requirements: [''],
    isActive: true,
    ...job
  });

  const [errors, setErrors] = useState<Partial<JobFormData>>({});

  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title || '',
        location: job.location || '',
        type: job.type || 'Full Time',
        description: job.description || '',
        requirements: job.requirements?.length ? [...job.requirements] : [''],
        isActive: job.isActive ?? true,
      });
    }
  }, [job]);

  const validateForm = (): boolean => {
    const newErrors: Partial<JobFormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Job title is required';
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Job description is required';
    }
    if (!formData.requirements.length || formData.requirements.every(req => !req.trim())) {
      newErrors.requirements = ['At least one requirement is needed'];
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Filter out empty requirements
      const cleanRequirements = formData.requirements.filter(req => req.trim());
      onSubmit({
        ...formData,
        requirements: cleanRequirements
      });
    }
  };

  const addRequirement = () => {
    setFormData(prev => ({
      ...prev,
      requirements: [...prev.requirements, '']
    }));
  };

  const removeRequirement = (index: number) => {
    if (formData.requirements.length > 1) {
      setFormData(prev => ({
        ...prev,
        requirements: prev.requirements.filter((_, i) => i !== index)
      }));
    }
  };

  const updateRequirement = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.map((req, i) => i === index ? value : req)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card border border-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-white">
            {job ? 'Edit Job Posting' : 'Create New Job Posting'}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="text-muted-foreground hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Job Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-white">Job Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Senior AI Engineer"
              className="bg-black border-border/50 text-white placeholder:text-gray-500"
            />
            {errors.title && (
              <p className="text-red-400 text-sm">{errors.title}</p>
            )}
          </div>

          {/* Location and Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location" className="text-white">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g., London, UK"
                className="bg-black border-border/50 text-white placeholder:text-gray-500"
              />
              {errors.location && (
                <p className="text-red-400 text-sm">{errors.location}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type" className="text-white">Job Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger className="bg-black border-border/50 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-white">
                  {jobTypes.map((type) => (
                    <SelectItem key={type} value={type} className="hover:bg-accent">
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Job Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">Job Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the role, responsibilities, and what you're looking for..."
              rows={6}
              className="bg-black border-border/50 text-white placeholder:text-gray-500 resize-none"
            />
            {errors.description && (
              <p className="text-red-400 text-sm">{errors.description}</p>
            )}
          </div>

          {/* Requirements */}
          <div className="space-y-3">
            <Label className="text-white">Requirements *</Label>
            <div className="space-y-2">
              {formData.requirements.map((requirement, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={requirement}
                    onChange={(e) => updateRequirement(index, e.target.value)}
                    placeholder={`Requirement ${index + 1}`}
                    className="bg-black border-border/50 text-white placeholder:text-gray-500"
                  />
                  {formData.requirements.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeRequirement(index)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={addRequirement}
              className="border-border/50 text-white hover:bg-accent"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Requirement
            </Button>
            {errors.requirements && (
              <p className="text-red-400 text-sm">{errors.requirements}</p>
            )}
          </div>

          {/* Active Status */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              className="w-4 h-4 text-primary bg-black border-border/50 rounded focus:ring-primary focus:ring-2"
            />
            <Label htmlFor="isActive" className="text-white">Active Job Posting</Label>
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
              {isLoading ? 'Saving...' : (job ? 'Update Job' : 'Create Job')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
