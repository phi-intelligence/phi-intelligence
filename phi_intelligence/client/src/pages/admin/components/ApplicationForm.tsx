import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Star, FileText, MessageSquare, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ApplicationFormData {
  status: string;
  priority: string;
  notes: string;
  assignedTo: string;
  rating: number;
  interviewDate?: string;
}

interface ApplicationFormProps {
  application: {
    id: string;
    jobId: string;
    jobTitle: string;
    personalInfo: string;
    experience: string;
    education: string;
    skills: string[];
    coverLetter: string;
    resumeUrl: string;
    status: string;
    notes?: string;
    priority: string;
    rating?: number;
    assignedTo?: string;
    interviewDate?: string;
    createdAt: string;
    updatedAt: string;
  };
  onSubmit: (data: ApplicationFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const applicationStatuses = [
  { value: 'new', label: 'New', color: 'bg-blue-500/20 text-blue-300' },
  { value: 'reviewing', label: 'Reviewing', color: 'bg-yellow-500/20 text-yellow-300' },
  { value: 'interviewing', label: 'Interviewing', color: 'bg-purple-500/20 text-purple-300' },
  { value: 'offered', label: 'Offered', color: 'bg-green-500/20 text-green-300' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-500/20 text-red-300' }
];

const priorities = [
  { value: 'low', label: 'Low', color: 'bg-gray-500/20 text-gray-300' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500/20 text-yellow-300' },
  { value: 'high', label: 'High', color: 'bg-red-500/20 text-red-300' }
];

const teamMembers = [
  'admin',
  'hr',
  'hiring_manager',
  'technical_lead',
  'recruiter'
];

const ratingOptions = [
  { value: 1, label: '1 - Poor' },
  { value: 2, label: '2 - Below Average' },
  { value: 3, label: '3 - Average' },
  { value: 4, label: '4 - Above Average' },
  { value: 5, label: '5 - Excellent' }
];

export default function ApplicationForm({ application, onSubmit, onCancel, isLoading = false }: ApplicationFormProps) {
  const [formData, setFormData] = useState<ApplicationFormData>({
    status: application.status || 'new',
    priority: application.priority || 'medium',
    notes: application.notes || '',
    assignedTo: application.assignedTo || '',
    rating: application.rating || 0,
    interviewDate: application.interviewDate || ''
  });

  const [errors, setErrors] = useState<Partial<ApplicationFormData>>({});

  useEffect(() => {
    setFormData({
      status: application.status || 'new',
      priority: application.priority || 'medium',
      notes: application.notes || '',
      assignedTo: application.assignedTo || '',
      rating: application.rating || 0,
      interviewDate: application.interviewDate || ''
    });
  }, [application]);

  const validateForm = (): boolean => {
    const newErrors: Partial<ApplicationFormData> = {};

    if (!formData.status) {
      newErrors.status = 'Status is required';
    }
    if (!formData.priority) {
      newErrors.priority = 'Priority is required';
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

  const parsePersonalInfo = (personalInfo: string) => {
    try {
      return JSON.parse(personalInfo);
    } catch {
      return { name: 'N/A', email: 'N/A', phone: 'N/A' };
    }
  };

  const parseExperience = (experience: string) => {
    try {
      return JSON.parse(experience);
    } catch {
      return [];
    }
  };

  const parseEducation = (education: string) => {
    try {
      return JSON.parse(education);
    } catch {
      return [];
    }
  };

  const personalInfo = parsePersonalInfo(application.personalInfo);
  const experienceList = parseExperience(application.experience);
  const educationList = parseEducation(application.education);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card border border-border rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-white">Edit Application</h2>
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
          {/* Application Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-muted/20 rounded-lg border border-border/50">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Candidate:</span>
                <span className="font-medium text-white">{personalInfo.name || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Position:</span>
                <span className="font-medium text-white">{application.jobTitle}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Applied:</span>
                <span className="font-medium text-white">{formatDate(application.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Resume:</span>
                <a 
                  href={application.resumeUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  View Resume
                </a>
              </div>
            </div>
          </div>

          {/* Candidate Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white border-b border-border pb-2">Candidate Details</h3>
              
              <div className="space-y-3">
                <div>
                  <Label className="text-sm text-muted-foreground">Email</Label>
                  <div className="text-white">{personalInfo.email || 'N/A'}</div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Phone</Label>
                  <div className="text-white">{personalInfo.phone || 'N/A'}</div>
                </div>
              </div>

              {/* Skills */}
              <div>
                <Label className="text-sm text-muted-foreground">Skills</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {application.skills?.map((skill, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-muted/30 rounded text-xs text-white border border-border/50"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Experience & Education */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white border-b border-border pb-2">Background</h3>
              
              {/* Experience */}
              <div>
                <Label className="text-sm text-muted-foreground">Experience</Label>
                <div className="space-y-2 mt-2 max-h-32 overflow-y-auto">
                  {experienceList.length > 0 ? experienceList.map((exp: any, index: number) => (
                    <div key={index} className="p-2 bg-muted/20 rounded text-sm">
                      <div className="font-medium text-white">{exp.title || 'N/A'}</div>
                      <div className="text-muted-foreground">{exp.company || 'N/A'} • {exp.duration || 'N/A'}</div>
                    </div>
                  )) : (
                    <div className="text-muted-foreground text-sm">No experience listed</div>
                  )}
                </div>
              </div>

              {/* Education */}
              <div>
                <Label className="text-sm text-muted-foreground">Education</Label>
                <div className="space-y-2 mt-2 max-h-32 overflow-y-auto">
                  {educationList.length > 0 ? educationList.map((edu: any, index: number) => (
                    <div key={index} className="p-2 bg-muted/20 rounded text-sm">
                      <div className="font-medium text-white">{edu.degree || 'N/A'}</div>
                      <div className="text-muted-foreground">{edu.institution || 'N/A'} • {edu.year || 'N/A'}</div>
                    </div>
                  )) : (
                    <div className="text-muted-foreground text-sm">No education listed</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Cover Letter */}
          <div className="space-y-2">
            <Label className="text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Cover Letter
            </Label>
            <div className="p-3 bg-muted/20 rounded border border-border/50 text-white max-h-32 overflow-y-auto">
              {application.coverLetter || 'No cover letter provided'}
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
                  {applicationStatuses.map((status) => (
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

            {/* Rating */}
            <div className="space-y-2">
              <Label htmlFor="rating" className="text-white flex items-center gap-2">
                <Star className="w-4 h-4" />
                Rating
              </Label>
                          <Select
              value={formData.rating === 0 ? "no-rating" : formData.rating.toString()}
              onValueChange={(value) => setFormData(prev => ({ ...prev, rating: value === "no-rating" ? 0 : parseInt(value) }))}
            >
              <SelectTrigger className="bg-black border-border/50 text-white">
                <SelectValue placeholder="Select rating" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border text-white">
                <SelectItem value="no-rating">No Rating</SelectItem>
                {ratingOptions.map((rating) => (
                  <SelectItem key={rating.value} value={rating.value.toString()} className="hover:bg-accent">
                    {rating.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {teamMembers.map((member) => (
                  <SelectItem key={member} value={member} className="hover:bg-accent capitalize">
                    {member.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            </div>
          </div>

          {/* Interview Date */}
          <div className="space-y-2">
            <Label htmlFor="interviewDate" className="text-white">Interview Date</Label>
            <Input
              type="datetime-local"
              id="interviewDate"
              value={formData.interviewDate || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, interviewDate: e.target.value }))}
              className="bg-black border-border/50 text-white w-full md:w-64"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-white">Internal Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Add internal notes about this application..."
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
              {isLoading ? 'Updating...' : 'Update Application'}
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
