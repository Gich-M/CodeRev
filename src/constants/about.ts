import { Code2, Users, Award, Shield, Zap, Heart } from 'lucide-react';

export const FEATURES = [
  {
    icon: Code2,
    title: "Code Review",
    description: "Get detailed feedback on your code from experienced developers"
  },
  {
    icon: Users,
    title: "Community",
    description: "Join a supportive community of developers helping each other grow"
  },
  {
    icon: Award,
    title: "Recognition",
    description: "Earn reputation points and badges for your contributions"
  },
  {
    icon: Shield,
    title: "Security",
    description: "Your code is safe with our secure infrastructure"
  },
  {
    icon: Zap,
    title: "Fast Feedback",
    description: "Get quick responses from our active community"
  },
  {
    icon: Heart,
    title: "Open Source",
    description: "Support for open source projects and contributions"
  }
] as const; 