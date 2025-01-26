import React from 'react';
import { Link } from 'react-router-dom';
import { Code2, Users, Award, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export function Home() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const features = [
    {
      icon: <Code2 className="w-6 h-6" />,
      title: "Share Code",
      description: "Share your code snippets and get valuable feedback"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Community Review",
      description: "Get insights from experienced developers"
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Earn Recognition",
      description: "Build reputation by helping others"
    }
  ];

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
            className="text-5xl font-bold mb-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Elevate Your Code Through
            <br />
            Peer Review
          </motion.h1>
          <motion.p 
            className="text-xl mb-8 text-indigo-100"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Join a community of developers helping each other write better code
          </motion.p>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Link
              to="/auth"
              className="inline-flex items-center px-6 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
            >
              Get Started
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Features Section */}
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
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              variants={fadeIn}
            >
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* CTA Section */}
      <motion.div 
        className="bg-gray-50 py-20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to improve your code?</h2>
          <p className="text-gray-600 mb-8">
            Join thousands of developers who are already sharing and reviewing code
          </p>
          <Link
            to="/auth"
            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Join the Community
          </Link>
        </div>
      </motion.div>
    </div>
  );
}