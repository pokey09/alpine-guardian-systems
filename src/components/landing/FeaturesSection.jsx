import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, FileText, GraduationCap, Mountain } from 'lucide-react';

const features = [
  {
    icon: MapPin,
    title: 'Real-Time Coordination',
    description: 'Map-based tools to track incidents, patrol locations, and priorities in one place.',
    gradient: 'from-red-600 to-red-700',
    bgLight: 'bg-red-50',
  },
  {
    icon: FileText,
    title: 'Incident Reporting',
    description: 'Log incidents quickly with standardized forms and exportable data.',
    gradient: 'from-gray-700 to-gray-800',
    bgLight: 'bg-gray-50',
  },
  {
    icon: GraduationCap,
    title: 'Training & Debriefs',
    description: 'Capture details that help with training, lessons learned, and season-end reviews.',
    gradient: 'from-red-500 to-red-600',
    bgLight: 'bg-red-50',
  },
  {
    icon: Mountain,
    title: 'Resort-Ready Setup',
    description: 'Designed to work for both small hills and large destination resorts.',
    gradient: 'from-gray-800 to-gray-900',
    bgLight: 'bg-gray-50',
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-24 md:py-32 bg-slate-50 relative overflow-hidden">
      {/* Animated grid background */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgb(226 232 240 / 0.3) 1px, transparent 1px),
              linear-gradient(to bottom, rgb(226 232 240 / 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
          animate={{
            x: [0, 30, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>
      
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 bg-white text-slate-600 text-sm font-medium rounded-full mb-4 shadow-sm">
            Platform Capabilities
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Everything your patrol needs
          </h2>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto">
            Purpose-built tools that make mountain operations safer and more efficient.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-white rounded-2xl p-8 border border-slate-200 h-full transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1">
                <motion.div 
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg`}
                  whileHover={{ 
                    scale: 1.1,
                    rotate: [0, -10, 10, -10, 0],
                    transition: { 
                      rotate: { duration: 0.5 },
                      scale: { duration: 0.2 }
                    }
                  }}
                >
                  <motion.div
                    whileHover={{
                      y: [-2, 2, -2],
                      transition: { duration: 0.4, repeat: 2 }
                    }}
                  >
                    <feature.icon className="w-7 h-7 text-white" />
                  </motion.div>
                </motion.div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}