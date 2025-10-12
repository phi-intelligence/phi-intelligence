import React, { useState, useEffect } from 'react';
import { Plus, Edit, Search, Filter, Download, Eye, Calendar, User, Building, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdmin } from '@/contexts/AdminContext';
import StatusBadge from './StatusBadge';
import ContactForm from './ContactForm';

interface Contact {
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
}

interface ContactFormData {
  status: string;
  priority: string;
  source: string;
  notes: string;
  assignedTo: string;
  lastContactedAt?: string;
}

export default function ContactsTable() {
  const { accessToken } = useAdmin();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    source: '',
    assignedTo: '',
    search: '',
    startDate: '',
    endDate: ''
  });

  // Pagination states
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchContacts();
  }, [accessToken, pagination.page, pagination.limit]);

  useEffect(() => {
    filterContacts();
  }, [contacts, filters]);

  const fetchContacts = async () => {
    if (!accessToken) return;

    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.status && { status: filters.status }),
        ...(filters.priority && { priority: filters.priority }),
        ...(filters.source && { source: filters.source }),
        ...(filters.assignedTo && { assignedTo: filters.assignedTo }),
        ...(filters.search && { search: filters.search }),
        ...(filters.startDate && filters.endDate && { 
          startDate: filters.startDate,
          endDate: filters.endDate 
        })
      });

      const response = await fetch(`/api/admin/contacts?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setContacts(data.contacts || []);
        setPagination(prev => ({
          ...prev,
          total: data.total || 0,
          totalPages: data.totalPages || 0
        }));
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterContacts = () => {
    let filtered = contacts;
    
    if (filters.search) {
      filtered = filtered.filter(contact =>
        (contact.name || '').toLowerCase().includes(filters.search.toLowerCase()) ||
        (contact.email || '').toLowerCase().includes(filters.search.toLowerCase()) ||
        (contact.company && contact.company.toLowerCase().includes(filters.search.toLowerCase()))
      );
    }
    
    setFilteredContacts(filtered);
  };

  const handleUpdateContact = async (contactData: ContactFormData) => {
    if (!accessToken || !editingContact) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/admin/contacts/${editingContact.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(contactData)
      });

      if (response.ok) {
        await fetchContacts();
        setEditingContact(null);
        setShowForm(false);
      }
    } catch (error) {
      console.error('Error updating contact:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setShowForm(true);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      priority: '',
      source: '',
      assignedTo: '',
      search: '',
      startDate: '',
      endDate: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const exportContacts = () => {
    const csvContent = [
      ['Name', 'Email', 'Company', 'Status', 'Priority', 'Source', 'Assigned To', 'Created Date', 'Last Contacted', 'Notes'],
      ...filteredContacts.map(contact => [
        contact.name || 'N/A',
        contact.email || 'N/A',
        contact.company || '',
        contact.status || 'new',
        contact.priority || 'medium',
        contact.source || 'contact_form',
        contact.assignedTo || '',
        contact.createdAt ? new Date(contact.createdAt).toLocaleDateString() : 'N/A',
        contact.lastContactedAt ? new Date(contact.lastContactedAt).toLocaleDateString() : '',
        contact.notes || ''
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contacts_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Contact Management</h2>
          <p className="text-muted-foreground">
            Manage business inquiries and lead tracking
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={exportContacts}
            variant="outline"
            className="border-border/50 text-white hover:bg-accent"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-card/80 border-border/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search contacts by name, email, or company..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-10 bg-black border-border/50 text-white placeholder:text-gray-500"
            />
          </div>

          {/* Filter Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select value={filters.status || "all"} onValueChange={(value) => handleFilterChange('status', value === "all" ? "" : value)}>
              <SelectTrigger className="bg-black border-border/50 text-white">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border text-white">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.priority || "all"} onValueChange={(value) => handleFilterChange('priority', value === "all" ? "" : value)}>
              <SelectTrigger className="bg-black border-border/50 text-white">
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border text-white">
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.source || "all"} onValueChange={(value) => handleFilterChange('source', value === "all" ? "" : value)}>
              <SelectTrigger className="bg-black border-border/50 text-white">
                <SelectValue placeholder="All Sources" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border text-white">
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="contact_form">Contact Form</SelectItem>
                <SelectItem value="career_page">Career Page</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.assignedTo || "all"} onValueChange={(value) => handleFilterChange('assignedTo', value === "all" ? "" : value)}>
              <SelectTrigger className="bg-black border-border/50 text-white">
                <SelectValue placeholder="All Assignees" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border text-white">
                <SelectItem value="all">All Assignees</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="sales">Sales</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="support">Support</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-white mb-2 block">Start Date</label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="bg-black border-border/50 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-white mb-2 block">End Date</label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="bg-black border-border/50 text-white"
              />
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {filteredContacts.length} of {pagination.total} contacts
            </div>
            <Button
              onClick={clearFilters}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-white"
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contacts Table */}
      <Card className="bg-card/80 border-border/50">
        <CardHeader>
          <CardTitle className="text-white">All Contacts</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredContacts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                {Object.values(filters).some(f => f) ? 'No contacts match your filters.' : 'No contacts yet.'}
              </p>
              {Object.values(filters).some(f => f) && (
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-4 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                                                 <div className="flex items-center gap-2 mb-2">
                           <h3 className="font-semibold text-white truncate">{contact.name}</h3>
                           <StatusBadge status={contact.status || 'new'} />
                           <StatusBadge status={contact.priority || 'medium'} />
                         </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              <span>{contact.email}</span>
                            </div>
                            {contact.company && (
                              <div className="flex items-center gap-2">
                                <Building className="w-4 h-4" />
                                <span>{contact.company}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>Created {formatDate(contact.createdAt)}</span>
                            </div>
                            {contact.lastContactedAt && (
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                <span>Contacted {formatDateTime(contact.lastContactedAt)}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {contact.notes && (
                          <div className="mt-2 p-2 bg-muted/30 rounded text-sm text-muted-foreground">
                            <strong>Notes:</strong> {contact.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditContact(contact)}
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            disabled={pagination.page <= 1}
            className="border-border/50 text-white hover:bg-accent"
          >
            Previous
          </Button>
          
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={pagination.page >= pagination.totalPages}
            className="border-border/50 text-white hover:bg-accent"
          >
            Next
          </Button>
        </div>
      )}

      {/* Contact Form Modal */}
      {showForm && editingContact && (
        <ContactForm
          contact={editingContact}
          onSubmit={handleUpdateContact}
          onCancel={() => {
            setShowForm(false);
            setEditingContact(null);
          }}
          isLoading={isSubmitting}
        />
      )}
    </div>
  );
}
