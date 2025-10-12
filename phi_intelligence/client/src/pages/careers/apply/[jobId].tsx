import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { ArrowLeft, Upload, FileText, User, Briefcase, GraduationCap, Code, MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { sanitizeFileInfo } from "@/utils/filenameUtils";

interface Job {
  id: string;
  title: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
  isActive: boolean;
  createdAt: string;
}

interface ApplicationForm {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    linkedin: string;
    portfolio: string;
    location: string;
    workAuthorization: string;
  };
  experience: Array<{
    company: string;
    title: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    graduationYear: string;
    gpa: string;
  }>;
  skills: string[];
  coverLetter: string;
  resume: File | null;
  resumeInfo: {
    originalName: string;
    sanitizedName: string;
    wasSanitized: boolean;
  } | null;
}

export default function JobApplicationForm() {
  const { jobId } = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isGeneralApplication, setIsGeneralApplication] = useState(false);
  const [formData, setFormData] = useState<ApplicationForm>({
    personalInfo: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      linkedin: "",
      portfolio: "",
      location: "",
      workAuthorization: "authorized"
    },
    experience: [{
      company: "",
      title: "",
      startDate: "",
      endDate: "",
      current: false,
      description: ""
    }],
    education: [{
      institution: "",
      degree: "",
      field: "",
      graduationYear: "",
      gpa: ""
    }],
    skills: [],
    coverLetter: "",
    resume: null,
    resumeInfo: null
  });

        // Handle job fetching and general application logic
      useEffect(() => {
        if (!jobId || jobId === 'general') {
          // General resume submission - no specific job
          setIsGeneralApplication(true);
          setJob({
            id: 'general',
            title: 'General Application',
            location: 'Remote/On-site',
            type: 'Full-time/Part-time/Contract',
            description: 'Submit your resume for general consideration. We\'ll review your profile and contact you when suitable opportunities arise.',
            requirements: ['Relevant experience in your field', 'Strong communication skills', 'Passion for innovation'],
            isActive: true,
            createdAt: new Date().toISOString()
          });
          setIsLoading(false);
        } else {
          // Specific job application
          const fetchJob = async () => {
            try {
              const response = await fetch(`/api/jobs/${jobId}`);
              if (response.ok) {
                const data = await response.json();
                setJob(data);
              } else {
                console.error('Failed to fetch job from backend');
              }
            } catch (error) {
              console.error('Error fetching job from backend:', error);
            } finally {
              setIsLoading(false);
            }
          };
          fetchJob();
        }
      }, [jobId]);

  const handlePersonalInfoChange = (field: keyof ApplicationForm['personalInfo'], value: string) => {
    setFormData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value
      }
    }));
  };

  const handleExperienceChange = (index: number, field: keyof ApplicationForm['experience'][0], value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experience: [...prev.experience, {
        company: "",
        title: "",
        startDate: "",
        endDate: "",
        current: false,
        description: ""
      }]
    }));
  };

  const removeExperience = (index: number) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const handleEducationChange = (index: number, field: keyof ApplicationForm['education'][0], value: string) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, {
        institution: "",
        degree: "",
        field: "",
        graduationYear: "",
        gpa: ""
      }]
    }));
  };

  const removeEducation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const addSkill = (skill: string) => {
    if (skill.trim() && !formData.skills.includes(skill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skill.trim()]
      }));
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please upload a PDF, DOCX, or TXT file');
        return;
      }
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      // Sanitize filename
      const sanitizedInfo = sanitizeFileInfo(file.name);
      
      // Create new File object with sanitized name
      const sanitizedFile = new File([file], sanitizedInfo.sanitizedName, {
        type: file.type,
        lastModified: file.lastModified
      });
      
      setFormData(prev => ({ 
        ...prev, 
        resume: sanitizedFile,
        resumeInfo: sanitizedInfo
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let resumeUrl = 'No resume uploaded';
      
      // Step 1: Upload resume file to R2 if provided
      if (formData.resume) {
        try {
          setIsUploading(true);
          setUploadProgress(0);
          
          // Generate unique applicant ID
          const applicantId = `${formData.personalInfo.firstName}_${formData.personalInfo.lastName}_${Date.now()}`;
          
          // Create FormData for file upload
          const uploadFormData = new FormData();
          uploadFormData.append('resume', formData.resume);
          uploadFormData.append('applicantId', applicantId);
          
          // Simulate upload progress
          const progressInterval = setInterval(() => {
            setUploadProgress(prev => Math.min(prev + 10, 90));
          }, 200);
          
          // Upload file to R2 storage
          const uploadResponse = await fetch(`/api/jobs/${jobId || 'general'}/resume-upload`, {
            method: 'POST',
            body: uploadFormData
          });
          
          clearInterval(progressInterval);
          setUploadProgress(100);
          
          if (!uploadResponse.ok) {
            const uploadError = await uploadResponse.json().catch(() => ({}));
            throw new Error(uploadError.error || 'Failed to upload resume');
          }
          
          const uploadResult = await uploadResponse.json();
          resumeUrl = uploadResult.fileUrl; // Real R2 URL
          
          console.log('✅ Resume uploaded successfully:', resumeUrl);
        } catch (uploadError: any) {
          console.error('❌ Resume upload failed:', uploadError);
          alert(`Resume upload failed: ${uploadError.message || 'Unknown error'}. Please try again.`);
          setIsSubmitting(false);
          return;
        } finally {
          setIsUploading(false);
          setUploadProgress(0);
        }
      }

      // Step 2: Transform data to match backend schema
      const submitData = {
        jobId: jobId || 'general',
        personalInfo: JSON.stringify(formData.personalInfo),
        experience: JSON.stringify(formData.experience),
        education: JSON.stringify(formData.education),
        skills: formData.skills.length > 0 ? formData.skills : null,
        coverLetter: formData.coverLetter,
        resumeUrl: resumeUrl // Now contains real R2 URL or fallback message
      };

      // Step 3: Submit application with real file URL
      const response = await fetch(`/api/jobs/${jobId || 'general'}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      });

              if (response.ok) {
        const result = await response.json();
        if (isGeneralApplication) {
          alert('Resume submitted successfully! We\'ll review your profile and contact you when suitable opportunities arise.');
        } else {
          alert('Application submitted successfully!');
        }
        // Redirect to careers page
        window.location.href = '/careers';
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-phi-black text-phi-white pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-phi-white mx-auto mb-4"></div>
          <p>Loading application form...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-phi-black text-phi-white pt-24 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Job Not Found</h2>
          <Link href="/careers">
            <Button>Back to Careers</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-phi-black text-phi-white pt-24">
      <div className="container mx-auto max-w-4xl px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/careers">
            <Button variant="ghost" className="mb-4 text-phi-white hover:bg-phi-gray">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Careers
            </Button>
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 glow-text">
            {isGeneralApplication ? 'Submit Your Resume' : `Apply for ${job.title}`}
          </h1>
          <div className="flex items-center gap-4 text-phi-light">
            <span>{job.location}</span>
            <span>•</span>
            <span>{job.type}</span>
          </div>
        </div>

        {/* Job Details - Only show for specific job applications */}
        {!isGeneralApplication && (
          <Card className="glassmorphism p-6 mb-8">
            <h3 className="text-xl font-bold mb-4">Job Description</h3>
            <p className="opacity-80 mb-4">{job.description}</p>
            <div>
              <h4 className="font-semibold mb-2">Requirements:</h4>
              <div className="flex flex-wrap gap-2">
                {job.requirements.map((req, index) => (
                  <Badge key={index} variant="secondary" className="bg-phi-gray text-phi-white">
                    {req}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* General Application Info - Only show for general applications */}
        {isGeneralApplication && (
          <Card className="glassmorphism p-6 mb-8">
            <h3 className="text-xl font-bold mb-4">General Application</h3>
            <p className="opacity-80 mb-4">
              Submit your resume for general consideration. We'll review your profile and contact you when suitable opportunities arise.
            </p>
            <div className="bg-phi-gray p-4 rounded-lg">
              <h4 className="font-semibold mb-2">What happens next?</h4>
              <ul className="space-y-2 text-sm opacity-80">
                <li>• We'll review your resume and profile</li>
                <li>• Keep your information on file for future opportunities</li>
                <li>• Contact you directly when positions match your skills</li>
                <li>• Consider you for upcoming roles that aren't yet posted</li>
              </ul>
            </div>
          </Card>
        )}

        {/* Application Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <Card className="glassmorphism p-6">
            <div className="flex items-center gap-2 mb-6">
              <User className="h-5 w-5 text-phi-light" />
              <h3 className="text-xl font-bold">Personal Information</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.personalInfo.firstName}
                  onChange={(e) => handlePersonalInfoChange('firstName', e.target.value)}
                  required
                  className="bg-phi-gray border-phi-white text-phi-white"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.personalInfo.lastName}
                  onChange={(e) => handlePersonalInfoChange('lastName', e.target.value)}
                  required
                  className="bg-phi-gray border-phi-white text-phi-white"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.personalInfo.email}
                  onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                  required
                  className="bg-phi-gray border-phi-white text-phi-white"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.personalInfo.phone}
                  onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                  required
                  className="bg-phi-gray border-phi-white text-phi-white"
                />
              </div>
              <div>
                <Label htmlFor="linkedin">LinkedIn Profile</Label>
                <Input
                  id="linkedin"
                  type="url"
                  value={formData.personalInfo.linkedin}
                  onChange={(e) => handlePersonalInfoChange('linkedin', e.target.value)}
                  className="bg-phi-gray border-phi-white text-phi-white"
                />
              </div>
              <div>
                <Label htmlFor="portfolio">Portfolio URL</Label>
                <Input
                  id="portfolio"
                  type="url"
                  value={formData.personalInfo.portfolio}
                  onChange={(e) => handlePersonalInfoChange('portfolio', e.target.value)}
                  className="bg-phi-gray border-phi-white text-phi-white"
                />
              </div>
              <div>
                <Label htmlFor="location">Current Location *</Label>
                <Input
                  id="location"
                  value={formData.personalInfo.location}
                  onChange={(e) => handlePersonalInfoChange('location', e.target.value)}
                  required
                  className="bg-phi-gray border-phi-white text-phi-white"
                />
              </div>
              <div>
                <Label htmlFor="workAuthorization">Work Authorization *</Label>
                <Select
                  value={formData.personalInfo.workAuthorization}
                  onValueChange={(value) => handlePersonalInfoChange('workAuthorization', value)}
                >
                  <SelectTrigger className="bg-phi-gray border-phi-white text-phi-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-phi-black border-phi-gray text-phi-white">
                    <SelectItem value="authorized">Authorized to work</SelectItem>
                    <SelectItem value="sponsor">Need sponsorship</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Professional Experience */}
          <Card className="glassmorphism p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-phi-light" />
                <h3 className="text-xl font-bold">Professional Experience</h3>
              </div>
              <Button type="button" onClick={addExperience} variant="outline" size="sm">
                Add Experience
              </Button>
            </div>
            <div className="space-y-4">
              {formData.experience.map((exp, index) => (
                <div key={index} className="border border-phi-gray rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold">Experience {index + 1}</h4>
                    {formData.experience.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeExperience(index)}
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Company *</Label>
                      <Input
                        value={exp.company}
                        onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                        required
                        className="bg-phi-gray border-phi-white text-phi-white"
                      />
                    </div>
                    <div>
                      <Label>Job Title *</Label>
                      <Input
                        value={exp.title}
                        onChange={(e) => handleExperienceChange(index, 'title', e.target.value)}
                        required
                        className="bg-phi-gray border-phi-white text-phi-white"
                      />
                    </div>
                    <div>
                      <Label>Start Date *</Label>
                      <Input
                        type="date"
                        value={exp.startDate}
                        onChange={(e) => handleExperienceChange(index, 'startDate', e.target.value)}
                        required
                        className="bg-phi-gray border-phi-white text-phi-white"
                      />
                    </div>
                    <div>
                      <Label>End Date</Label>
                      <Input
                        type="date"
                        value={exp.endDate}
                        onChange={(e) => handleExperienceChange(index, 'endDate', e.target.value)}
                        disabled={exp.current}
                        className="bg-phi-gray border-phi-white text-phi-white"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        id={`current-${index}`}
                        checked={exp.current}
                        onChange={(e) => handleExperienceChange(index, 'current', e.target.checked)}
                        className="rounded border-phi-white"
                      />
                      <Label htmlFor={`current-${index}`}>I currently work here</Label>
                    </div>
                    <Label>Description *</Label>
                    <Textarea
                      value={exp.description}
                      onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                      required
                      placeholder="Describe your responsibilities and achievements..."
                      className="bg-phi-gray border-phi-white text-phi-white"
                      rows={3}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Education */}
          <Card className="glassmorphism p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-phi-light" />
                <h3 className="text-xl font-bold">Education</h3>
              </div>
              <Button type="button" onClick={addEducation} variant="outline" size="sm">
                Add Education
              </Button>
            </div>
            <div className="space-y-4">
              {formData.education.map((edu, index) => (
                <div key={index} className="border border-phi-gray rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold">Education {index + 1}</h4>
                    {formData.education.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeEducation(index)}
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Institution *</Label>
                      <Input
                        value={edu.institution}
                        onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                        required
                        className="bg-phi-gray border-phi-white text-phi-white"
                      />
                    </div>
                    <div>
                      <Label>Degree *</Label>
                      <Input
                        value={edu.degree}
                        onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                        required
                        className="bg-phi-gray border-phi-white text-phi-white"
                      />
                    </div>
                    <div>
                      <Label>Field of Study *</Label>
                      <Input
                        value={edu.field}
                        onChange={(e) => handleEducationChange(index, 'field', e.target.value)}
                        required
                        className="bg-phi-gray border-phi-white text-phi-white"
                      />
                    </div>
                    <div>
                      <Label>Graduation Year *</Label>
                      <Input
                        value={edu.graduationYear}
                        onChange={(e) => handleEducationChange(index, 'graduationYear', e.target.value)}
                        required
                        className="bg-phi-gray border-phi-white text-phi-white"
                      />
                    </div>
                    <div>
                      <Label>GPA (Optional)</Label>
                      <Input
                        value={edu.gpa}
                        onChange={(e) => handleEducationChange(index, 'gpa', e.target.value)}
                        placeholder="e.g., 3.8"
                        className="bg-phi-gray border-phi-white text-phi-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Skills */}
          <Card className="glassmorphism p-6">
            <div className="flex items-center gap-2 mb-6">
              <Code className="h-5 w-5 text-phi-light" />
              <h3 className="text-xl font-bold">Skills & Technologies</h3>
            </div>
            <div className="mb-4">
              <Label>Add Skill</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., React, Python, Machine Learning..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSkill((e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                  className="bg-phi-gray border-phi-white text-phi-white"
                />
                <Button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById('skill-input') as HTMLInputElement;
                    if (input) {
                      addSkill(input.value);
                      input.value = '';
                    }
                  }}
                  variant="outline"
                >
                  Add
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-phi-gray text-phi-white cursor-pointer hover:bg-red-600"
                  onClick={() => removeSkill(skill)}
                >
                  {skill} ×
                </Badge>
              ))}
            </div>
          </Card>

          {/* Cover Letter */}
          <Card className="glassmorphism p-6">
            <div className="flex items-center gap-2 mb-6">
              <MessageSquare className="h-5 w-5 text-phi-light" />
              <h3 className="text-xl font-bold">Cover Letter</h3>
            </div>
            <Label htmlFor="coverLetter">Tell us why you're interested in this role and how your experience aligns with our requirements *</Label>
            <Textarea
              id="coverLetter"
              value={formData.coverLetter}
              onChange={(e) => setFormData(prev => ({ ...prev, coverLetter: e.target.value }))}
              required
              placeholder="Write a compelling cover letter explaining your interest in this position..."
              className="bg-phi-gray border-phi-white text-phi-white mt-2"
              rows={6}
            />
          </Card>

          {/* Resume Upload */}
          <Card className="glassmorphism p-6">
            <div className="flex items-center gap-2 mb-6">
              <FileText className="h-5 w-5 text-phi-light" />
              <h3 className="text-xl font-bold">Resume/CV Upload</h3>
            </div>
            <div className="border-2 border-dashed border-phi-gray rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 text-phi-light mx-auto mb-4" />
              <Label htmlFor="resume" className="cursor-pointer">
                <div className="mb-2">
                  <span className="text-phi-light font-semibold">Click to upload</span> or drag and drop
                </div>
                <div className="text-sm opacity-60 mb-4">
                  PDF, DOCX, or TXT (max 5MB)
                </div>
                {formData.resume && (
                  <div className="text-phi-light mb-4">
                    Selected: {formData.resume.name}
                  </div>
                )}
                
                {/* Upload Progress */}
                {isUploading && (
                  <div className="mt-4">
                    <div className="w-full bg-phi-gray rounded-full h-2 mb-2">
                      <div 
                        className="bg-phi-light h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-phi-light">
                      {uploadProgress < 100 ? 'Uploading...' : 'Upload complete!'}
                    </p>
                  </div>
                )}
              </Label>
              <Input
                id="resume"
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileUpload}
                required
                className="hidden"
                disabled={isUploading}
              />
            </div>
          </Card>

          {/* Submit Button */}
          <div className="text-center">
            <Button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="btn-primary px-12 py-4 rounded-lg font-semibold text-lg"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Uploading Resume...
                </>
              ) : isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Submitting Application...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5 mr-2" />
                  Submit Application
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
