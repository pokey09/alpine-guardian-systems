import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, User, Building, Briefcase, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    resort: '',
    role: '',
    email: '',
    message: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error for this field when user starts typing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const subject = encodeURIComponent(`Interest from ${formData.name} - ${formData.resort}`);
    const body = encodeURIComponent(
      `Name: ${formData.name}\nResort: ${formData.resort}\nRole: ${formData.role}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
    );
    window.location.href = `mailto:alpineguardiansystems@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <section id="contact" className="py-24 md:py-32 bg-slate-50 relative overflow-hidden">
      {/* Animated background circles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${150 + i * 50}px`,
              height: `${150 + i * 50}px`,
              left: `${10 + i * 20}%`,
              top: `${10 + i * 15}%`,
              background: `radial-gradient(circle, ${
                i % 2 === 0 ? 'rgba(239, 68, 68, 0.03)' : 'rgba(71, 85, 105, 0.03)'
              } 0%, transparent 70%)`,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 bg-white text-slate-600 text-sm font-medium rounded-full mb-4 shadow-sm">
            Get In Touch
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Interested in modernizing your ski patrol?
          </h2>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto">
            We're looking to connect with patrol teams and resorts interested in early access, 
            feedback, and partnerships.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
            <div className="grid md:grid-cols-5">
              {/* Contact info sidebar */}
              <div className="md:col-span-2 bg-gradient-to-br from-gray-900 to-gray-800 p-8 md:p-10 text-white">
                <h3 className="text-2xl font-bold mb-6">Let's connect</h3>
                <p className="text-slate-300 mb-8 leading-relaxed">
                  Whether you have questions, ideas, or just want to learn more, 
                  we'd love to hear from you.
                </p>
                
                <div className="space-y-4">
                  <a 
                    href="mailto:alpineguardiansystems@gmail.com"
                    className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-400">Email us</p>
                      <p className="font-medium group-hover:text-red-400 transition-colors break-all">
                        alpineguardiansystems@gmail.com
                      </p>
                    </div>
                  </a>
                </div>

                <div className="mt-10 pt-8 border-t border-white/10">
                  <p className="text-slate-400 text-sm">
                    Looking for early access or partnership opportunities? 
                    Fill out the form and we'll be in touch.
                  </p>
                </div>
              </div>

              {/* Form */}
              <div className="md:col-span-3 p-8 md:p-10">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-slate-700 flex items-center gap-2">
                        <User className="w-4 h-4" /> Name
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your name"
                        className={`h-12 rounded-xl border-slate-200 focus:border-red-500 focus:ring-red-500/20 ${errors.name ? 'border-red-500' : ''}`}
                        required
                      />
                      {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="resort" className="text-slate-700 flex items-center gap-2">
                        <Building className="w-4 h-4" /> Resort
                      </Label>
                      <Input
                        id="resort"
                        name="resort"
                        value={formData.resort}
                        onChange={handleChange}
                        placeholder="Resort or organization"
                        className="h-12 rounded-xl border-slate-200 focus:border-red-500 focus:ring-red-500/20"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="role" className="text-slate-700 flex items-center gap-2">
                        <Briefcase className="w-4 h-4" /> Role
                      </Label>
                      <Input
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        placeholder="Your role"
                        className="h-12 rounded-xl border-slate-200 focus:border-red-500 focus:ring-red-500/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-slate-700 flex items-center gap-2">
                        <Mail className="w-4 h-4" /> Email
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className={`h-12 rounded-xl border-slate-200 focus:border-red-500 focus:ring-red-500/20 ${errors.email ? 'border-red-500' : ''}`}
                        required
                      />
                      {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-slate-700 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" /> Message
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us about your interest or ask us anything..."
                      className={`min-h-[120px] rounded-xl border-slate-200 focus:border-red-500 focus:ring-red-500/20 resize-none ${errors.message ? 'border-red-500' : ''}`}
                    />
                    {errors.message && <p className="text-sm text-red-500">{errors.message}</p>}
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-14 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl text-lg font-medium shadow-lg shadow-red-500/25 transition-all duration-300 hover:shadow-red-500/40"
                  >
                    <Send className="w-5 h-5 mr-2" />
                    Send Message
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}