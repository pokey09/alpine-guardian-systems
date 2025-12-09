import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Sparkles } from 'lucide-react';

export default function ProblemSolutionSection() {
  return (
    <section className="py-24 md:py-32 bg-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-red-500/5"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 5 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
      
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 bg-slate-100 text-slate-600 text-sm font-medium rounded-full mb-4">
            Why We Exist
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
            From challenge to clarity
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {/* Problem */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-3xl blur-xl" />
            <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-8 md:p-10 border border-slate-200 h-full">
              <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mb-6">
                <AlertTriangle className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">The Problem</h3>
              <p className="text-slate-600 text-lg leading-relaxed">
                Outdated radios, scattered notes, and limited data make it harder for ski patrol 
                teams to respond quickly and stay coordinated on busy days. Critical information 
                gets lost, response times suffer, and teams struggle to learn from past incidents.
              </p>
            </div>
          </motion.div>

          {/* Solution */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-red-500/20 to-red-600/20 rounded-3xl blur-xl" />
            <div className="relative bg-gradient-to-br from-white to-red-50/30 rounded-2xl p-8 md:p-10 border border-red-200/50 h-full">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center mb-6 shadow-lg shadow-red-500/20">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Our Solution</h3>
              <p className="text-slate-600 text-lg leading-relaxed">
                Alpine Guardian Systems delivers digital tools built specifically for ski patrols—improving 
                communication, incident tracking, and on-mountain awareness. Everything your team needs, 
                designed by people who understand mountain operations.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}