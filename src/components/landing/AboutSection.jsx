import React from 'react';
import { motion } from 'framer-motion';

export default function AboutSection() {
  return (
    <section className="py-24 md:py-32 bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <motion.svg 
          className="absolute bottom-0 w-full h-[40%]" 
          viewBox="0 0 1440 300" 
          preserveAspectRatio="none"
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        >
          <path fill="currentColor" className="text-white" d="M0,300 L0,200 L200,100 L400,180 L600,50 L800,150 L1000,30 L1200,130 L1440,80 L1440,300 Z" />
        </motion.svg>
      </div>
      
      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: i % 2 === 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.2)',
            }}
            animate={{
              y: [-20, 20, -20],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
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
          className="text-center"
        >
          <span className="inline-block px-4 py-1.5 bg-white/10 text-white/80 text-sm font-medium rounded-full mb-6 backdrop-blur-sm">
            About Us
          </span>

          <p className="text-2xl md:text-3xl text-white/90 leading-relaxed mb-10 font-light">
            Alpine Guardian Systems exists to modernize ski patrol operations with practical, 
            reliable technology. We focus on improving response speed, communication, and 
            documentation so patrollers can focus on what matters most:
            <span className="font-semibold text-white"> keeping guests safe.</span>
          </p>

          <div className="inline-block">
            <p className="text-xl md:text-2xl font-medium bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
              Modern tools for mountain heroes.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}