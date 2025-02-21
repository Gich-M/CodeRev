import { motion } from 'framer-motion';
import { FeatureCard } from '../components/FeatureCard';
import { FEATURES } from '../constants/about';

export function About() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <motion.div 
        className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white py-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.h1 
            className="text-4xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            About CodeRev
          </motion.h1>
          <motion.p 
            className="text-xl text-indigo-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            We're building the best platform for developers to share and improve their code
          </motion.p>
        </div>
      </motion.div>

      {/* Features Grid */}
      <div className="max-w-6xl mx-auto px-4 py-20">
        <motion.div 
          className="grid md:grid-cols-3 gap-8"
          variants={{
            animate: {
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          initial="initial"
          animate="animate"
        >
          {FEATURES.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={<feature.icon className="w-6 h-6" />}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </motion.div>
      </div>

      {/* Mission Section */}
      <motion.div 
        className="bg-gray-50 py-20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Our Mission</h2>
          <div className="prose prose-lg mx-auto">
            <p className="text-gray-600 text-center">
              We believe that every developer deserves access to quality code review and feedback.
              Our mission is to create a supportive environment where developers of all skill levels
              can learn from each other and grow together.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}