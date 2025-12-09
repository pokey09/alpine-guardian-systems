import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HeroSection() {
  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black pt-20">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Parallax mountain silhouettes */}
        <motion.div 
          className="absolute top-0 left-0 w-full h-full opacity-10"
          style={{ y: 0 }}
          animate={{ y: [0, -30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <svg className="absolute bottom-0 w-full h-[60%]" viewBox="0 0 1440 400" preserveAspectRatio="none">
            <path fill="currentColor" className="text-white/20" d="M0,400 L0,300 L200,150 L400,280 L600,100 L800,220 L1000,80 L1200,200 L1440,120 L1440,400 Z" />
          </svg>
        </motion.div>
        
        <motion.div 
          className="absolute top-0 left-0 w-full h-full opacity-10"
          style={{ y: 0 }}
          animate={{ y: [0, -50, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        >
          <svg className="absolute bottom-0 w-full h-[60%]" viewBox="0 0 1440 400" preserveAspectRatio="none">
            <path fill="currentColor" className="text-white/10" d="M0,400 L0,320 L150,200 L350,300 L550,150 L750,250 L950,120 L1150,230 L1350,150 L1440,180 L1440,400 Z" />
          </svg>
        </motion.div>
        
        {/* Floating particles */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              background: i % 3 === 0 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255, 255, 255, 0.2)',
            }}
            animate={{
              y: [-20, 20, -20],
              x: [-10, 10, -10],
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut",
            }}
          />
        ))}
        
        {/* Glowing orbs */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`orb-${i}`}
            className="absolute w-96 h-96 rounded-full"
            style={{
              left: `${20 + i * 30}%`,
              top: `${20 + i * 20}%`,
              background: 'radial-gradient(circle, rgba(239, 68, 68, 0.1) 0%, transparent 70%)',
              filter: 'blur(40px)',
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.5, 0.3],
              x: [-30, 30, -30],
              y: [-20, 20, -20],
            }}
            transition={{
              duration: 15 + i * 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Logo / Brand */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="inline-flex items-center justify-center mb-6">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69386993c4c28da2d1fc07c3/6b5bc90fc_AdobeExpress-file.png" 
              alt="Alpine Guardian Systems"
              className="w-48 h-48 md:w-64 md:h-64 object-contain"
            />
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight"
        >
          Modern tools for
          <span className="block bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
            mountain heroes.
          </span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed font-light"
        >
          Alpine Guardian Systems builds technology that helps ski patrols respond faster, 
          coordinate better, and keep every rider safe.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-16 sm:mb-0"
        >
          <Button
            onClick={scrollToContact}
            size="lg"
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-8 py-6 text-lg rounded-full shadow-xl shadow-red-500/25 transition-all duration-300 hover:scale-105 hover:shadow-red-500/40"
          >
            Request Early Access
          </Button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-white/40"
        >
          <ChevronDown className="w-8 h-8" />
        </motion.div>
      </motion.div>
    </section>
  );
}