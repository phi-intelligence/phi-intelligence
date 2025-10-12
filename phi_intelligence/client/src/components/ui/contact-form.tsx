import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertContactSchema, type InsertContact } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Send } from "lucide-react";

export default function ContactForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertContact>({
    resolver: zodResolver(insertContactSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      service: "",
      message: "",
    },
  });

  const submitContactMutation = useMutation({
    mutationFn: async (data: InsertContact) => {
      const response = await apiRequest("POST", "/api/contacts", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Message Sent",
        description: "Thank you for your message. We'll get back to you soon!",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      console.error("Contact form error:", error);
    },
  });

  const onSubmit = (data: InsertContact) => {
    submitContactMutation.mutate(data);
  };

  return (
    <div className="p-8 rounded-xl border border-white/20 bg-black/50" data-testid="contact-form">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-white">Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Your Full Name"
                    className="bg-black/50 text-white border-white/30 focus:ring-2 focus:ring-white/50 focus:border-white/50 placeholder:text-white/50"
                    data-testid="input-name"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-white">Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="your.email@company.com"
                    className="bg-black/50 text-white border-white/30 focus:ring-2 focus:ring-white/50 focus:border-white/50 placeholder:text-white/50"
                    data-testid="input-email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-white">Company</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Your Company Name"
                    className="bg-black/50 text-white border-white/30 focus:ring-2 focus:ring-white/50 focus:border-white/50 placeholder:text-white/50"
                    data-testid="input-company"
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="service"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-white">
                  Service Interest
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                  <FormControl>
                    <SelectTrigger
                      className="bg-black/50 text-white border-white/30 focus:ring-2 focus:ring-white/50 focus:border-white/50"
                      data-testid="select-service"
                    >
                      <SelectValue placeholder="Select a Service" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-black border-white/30">
                    <SelectItem value="voice-agents">Custom Voice Agents</SelectItem>
                    <SelectItem value="workforce-management">Workforce Management</SelectItem>
                    <SelectItem value="custom-development">Custom Software Development</SelectItem>
                    <SelectItem value="ai-consulting">AI Consulting</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-white">Message</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={4}
                    placeholder="Tell us about your project requirements..."
                    className="bg-black/50 text-white border-white/30 focus:ring-2 focus:ring-white/50 focus:border-white/50 placeholder:text-white/50"
                    data-testid="textarea-message"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={submitContactMutation.isPending}
            className="bg-white hover:bg-white/90 text-black w-full py-4 rounded-lg font-semibold text-lg"
            data-testid="button-submit"
          >
            {submitContactMutation.isPending ? "Sending..." : "Send Message"}
            <Send className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </Form>
    </div>
  );
}
