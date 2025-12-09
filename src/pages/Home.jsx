import React from 'react';
import Header from '../components/landing/Header';
import HeroSection from '../components/landing/HeroSection';
import ProblemSolutionSection from '../components/landing/ProblemSolutionSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import AudienceSection from '../components/landing/AudienceSection';
import AboutSection from '../components/landing/AboutSection';
import ContactSection from '../components/landing/ContactSection';
import Footer from '../components/landing/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <ProblemSolutionSection />
      <FeaturesSection />
      <AudienceSection />
      <AboutSection />
      <ContactSection />
      <Footer />
    </div>
  );
}