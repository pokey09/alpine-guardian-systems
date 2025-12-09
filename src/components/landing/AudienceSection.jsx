import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Building2, Users } from 'lucide-react';

const audiences = [
  {
    icon: Shield,
    title: 'Ski Patrol Teams',
    description: 'Frontline responders who need reliable tools that work in any conditions.',
  },
  {
    icon: Building2,
    title: 'Resort Operations & Management',
    description: 'Leaders seeking better data and visibility into mountain safety.',
  },
  {
    icon: Users,
    title: 'Training & Safety Coordinators',
    description: 'Professionals focused on continuous improvement and compliance.',
  },
];

export default function AudienceSection() {
  return (
    <section className="py-24 md:py-32 bg-white relative overflow-hidden">
      {/* Subtle floating elements */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${10 + i * 12}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
            animate={{
              y: [-15, 15, -15],
              rotate: [0, 180, 360],
              opacity: [0.05, 0.15, 0.05],
            }}
            transition={{
              duration: 8 + i,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-red-500/10 to-gray-500/10 blur-sm" />
          </motion.div>
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
            Built For You
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Who it's for
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {audiences.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-5 transition-all duration-300 hover:bg-slate-900 group">
                <item.icon className="w-8 h-8 text-slate-700 transition-colors duration-300 group-hover:text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-slate-600">{item.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center"
        >
          <div className="inline-block bg-gradient-to-r from-slate-100 to-slate-50 rounded-2xl px-8 py-6 border border-slate-200">
            <p className="text-slate-700 text-lg">
              Whether you run a small community hill or a multi-mountain operation,
              <span className="font-semibold text-slate-900"> Alpine Guardian Systems is designed to scale with you.</span>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}