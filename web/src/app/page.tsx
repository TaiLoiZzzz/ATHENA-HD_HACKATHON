'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  SparklesIcon, 
  CurrencyDollarIcon, 
  ShoppingBagIcon,
  ChartBarIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  BoltIcon,
  StarIcon,
  ArrowRightIcon,
  PlayIcon,
  WalletIcon,
  CreditCardIcon,
  BanknotesIcon,
  TrophyIcon,
  FireIcon,
  LightBulbIcon,
  RocketLaunchIcon,
  BeakerIcon,
  CubeTransparentIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import SovicoBranding from '@/components/Sovico/SovicoBranding';

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  gradient: string;
  delay?: number;
}

interface StatItemProps {
  value: string;
  label: string;
  delay?: number;
}

interface FloatingElementProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
}

const FloatingElement = ({ children, delay = 0, duration = 6 }: FloatingElementProps) => {
  return (
    <motion.div
      initial={{ y: 0 }}
      animate={{ y: [-10, 10, -10] }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay
      }}
    >
      {children}
    </motion.div>
  );
};

const FeatureCard = ({ icon: Icon, title, description, gradient, delay = 0 }: FeatureCardProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.9 }}
      transition={{ duration: 0.6, delay, type: "spring", stiffness: 100 }}
      whileHover={{ 
        scale: 1.05, 
        y: -5,
        transition: { duration: 0.2 }
      }}
      className="group relative"
    >
      <div className={`relative p-8 rounded-3xl bg-gradient-to-br ${gradient} backdrop-blur-sm border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500`}>
        {/* Animated background effect */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        {/* Floating icon background */}
        <div className="absolute top-4 right-4 w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
          <FloatingElement delay={delay}>
            <Icon className="h-8 w-8 text-white" />
          </FloatingElement>
        </div>

        <div className="relative z-10">
          <div className="mb-6">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm">
              <Icon className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
            <p className="text-white/90 leading-relaxed">{description}</p>
          </div>

          <motion.div
            className="flex items-center text-white font-medium group-hover:translate-x-2 transition-transform duration-300"
            whileHover={{ x: 5 }}
          >
            <span className="mr-2">Explore</span>
            <ArrowRightIcon className="h-4 w-4" />
          </motion.div>
        </div>

        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 rounded-3xl opacity-10 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]"></div>
      </div>
    </motion.div>
  );
};

const StatItem = ({ value, label, delay = 0 }: StatItemProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (isInView) {
      const target = parseInt(value.replace(/[^\d]/g, ''));
      const increment = target / 100;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setCount(target);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, 20);

      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
      transition={{ duration: 0.6, delay, type: "spring", stiffness: 200 }}
      className="text-center group"
    >
      <motion.div 
        className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        {value.includes('K') || value.includes('M') || value.includes('+') 
          ? value 
          : count.toLocaleString() + value.slice(-1)}
      </motion.div>
      <div className="text-gray-600 font-medium group-hover:text-gray-800 transition-colors duration-300">
        {label}
      </div>
    </motion.div>
  );
};

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const { scrollYProgress } = useScroll();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '200%']);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    {
      icon: WalletIcon,
      title: "Web3 Wallet Integration",
      description: "Connect your MetaMask wallet and manage digital assets with enterprise-grade security and seamless DeFi integration.",
      gradient: "from-purple-600 via-purple-700 to-indigo-800",
    },
    {
      icon: CurrencyDollarIcon,
      title: "SOV Token Ecosystem",
      description: "Earn, stake, and trade SOV tokens with advanced yield farming, governance voting, and exclusive rewards.",
      gradient: "from-blue-600 via-cyan-600 to-teal-700",
    },
    {
      icon: ShoppingBagIcon,
      title: "Smart Commerce",
      description: "Book flights, banking services, and lifestyle products with AI-powered recommendations and crypto payments.",
      gradient: "from-emerald-600 via-green-600 to-teal-700",
    },
    {
      icon: ChartBarIcon,
      title: "DeFi Analytics",
      description: "Real-time portfolio tracking, yield optimization, and advanced trading analytics with institutional-grade insights.",
      gradient: "from-orange-600 via-red-600 to-pink-700",
    },
    {
      icon: ShieldCheckIcon,
      title: "Enterprise Security",
      description: "Multi-signature wallets, hardware security modules, and zero-knowledge proofs for maximum asset protection.",
      gradient: "from-violet-600 via-purple-600 to-indigo-700",
    },
    {
      icon: RocketLaunchIcon,
      title: "Innovation Lab",
      description: "Access cutting-edge blockchain experiments, NFT collections, and next-generation financial instruments.",
      gradient: "from-rose-600 via-pink-600 to-purple-700",
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Dynamic Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated gradient orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-3xl"
          animate={{
            x: mousePosition.x * 50,
            y: mousePosition.y * 50,
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-full blur-3xl"
          animate={{
            x: mousePosition.x * -30,
            y: mousePosition.y * -30,
            scale: [1.2, 1, 1.2],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full blur-3xl"
          animate={{
            x: mousePosition.x * 20,
            y: mousePosition.y * 20,
            rotate: 360,
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />

        {/* Floating geometric shapes */}
        <FloatingElement delay={0} duration={8}>
          <div className="absolute top-20 right-20 w-8 h-8 border-2 border-white/20 rotate-45" />
        </FloatingElement>
        <FloatingElement delay={2} duration={6}>
          <div className="absolute top-40 left-20 w-6 h-6 bg-gradient-to-r from-purple-400/30 to-pink-400/30 rounded-full" />
        </FloatingElement>
        <FloatingElement delay={4} duration={10}>
          <div className="absolute bottom-40 right-40 w-4 h-4 bg-gradient-to-r from-blue-400/30 to-cyan-400/30" />
        </FloatingElement>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4">
        <div className="container mx-auto text-center relative z-10">
          <motion.div
            style={{ y: textY }}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, type: "spring", stiffness: 100 }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6, type: "spring" }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-white/20 backdrop-blur-sm mb-8"
            >
              <SparklesIcon className="h-5 w-5 text-purple-300 mr-2" />
              <span className="text-purple-200 font-medium">Web3 Super-App Platform</span>
              <motion.div
                className="ml-2 w-2 h-2 bg-green-400 rounded-full"
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              className="text-5xl lg:text-7xl font-bold mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <span className="bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
                The Future of
              </span>
              <br />
              <motion.span
                className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent"
                animate={{ backgroundPosition: ["0%", "100%", "0%"] }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              >
                Digital Finance
              </motion.span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="text-xl lg:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              Experience the next generation of financial services with{' '}
              <span className="text-purple-300 font-semibold">blockchain technology</span>,{' '}
              <span className="text-cyan-300 font-semibold">DeFi protocols</span>, and{' '}
              <span className="text-pink-300 font-semibold">AI-powered insights</span> in one unified platform.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              {isAuthenticated ? (
                <Link href="">
                  <motion.button
                    className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl font-semibold text-white text-lg shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 overflow-hidden"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="relative z-10 flex items-center">
                      Go to Dashboard
                      <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </motion.button>
                </Link>
              ) : (
                <Link href="/auth/login">
                  <motion.button
                    className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl font-semibold text-white text-lg shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 overflow-hidden"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="relative z-10 flex items-center">
                      Get Started
                      <RocketLaunchIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </motion.button>
                </Link>
              )}

              <motion.button
                onClick={() => setIsVideoPlaying(true)}
                className="group flex items-center px-6 py-4 rounded-2xl border border-white/20 backdrop-blur-sm text-white font-medium hover:bg-white/10 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-3">
                  <PlayIcon className="h-5 w-5 text-white ml-1" />
                </div>
                <span>Watch Demo</span>
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Floating Dashboard Preview */}
          <motion.div
            className="mt-20 relative"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 1, type: "spring", stiffness: 50 }}
          >
            <div className="relative max-w-5xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-3xl transform rotate-6" />
              <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl p-2 border border-white/10 shadow-2xl">
                <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-2xl p-8 backdrop-blur-sm">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Mock dashboard cards */}
                    <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-2xl p-6 border border-white/10">
                      <div className="flex items-center justify-between mb-4">
                        <WalletIcon className="h-8 w-8 text-purple-400" />
                        <span className="text-green-400 text-sm font-medium">+24.5%</span>
                      </div>
                      <div className="text-2xl font-bold text-white mb-2">12,847 SOV</div>
                      <div className="text-gray-400 text-sm">Portfolio Value</div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-2xl p-6 border border-white/10">
                      <div className="flex items-center justify-between mb-4">
                        <FireIcon className="h-8 w-8 text-blue-400" />
                        <span className="text-green-400 text-sm font-medium">18.5% APY</span>
                      </div>
                      <div className="text-2xl font-bold text-white mb-2">5,230 SOV</div>
                      <div className="text-gray-400 text-sm">Staked Tokens</div>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-600/20 to-teal-600/20 rounded-2xl p-6 border border-white/10">
                      <div className="flex items-center justify-between mb-4">
                        <TrophyIcon className="h-8 w-8 text-emerald-400" />
                        <span className="text-emerald-400 text-sm font-medium">Platinum</span>
                      </div>
                      <div className="text-2xl font-bold text-white mb-2">2,847</div>
                      <div className="text-gray-400 text-sm">Reputation Score</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Trusted by{' '}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Innovators
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Join thousands of users who are already experiencing the future of finance
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            <StatItem value="50K+" label="Active Users" delay={0.1} />
            <StatItem value="$2.5M" label="Total Volume" delay={0.2} />
            <StatItem value="99.9%" label="Uptime" delay={0.3} />
            <StatItem value="24/7" label="Support" delay={0.4} />
          </div>
        </div>
      </section>

      {/* Sovico Branding Section */}
      <section className="relative py-20 px-4 bg-gradient-to-b from-transparent to-slate-800/50">
        <div className="container mx-auto">
          <SovicoBranding />
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Powerful{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Features
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Everything you need to manage, grow, and optimize your digital assets in one comprehensive platform
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                gradient={feature.gradient}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
            viewport={{ once: true }}
            className="relative max-w-4xl mx-auto"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-3xl" />
            <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-12 border border-white/20">
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                Ready to{' '}
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Transform
                </span>{' '}
                Your Finance?
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Join the revolution and start earning, staking, and trading with the most advanced Web3 platform.
              </p>
              
              {!isAuthenticated && (
                <Link href="/auth/login">
                  <motion.button
                    className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl font-semibold text-white text-lg shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 overflow-hidden"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="relative z-10 flex items-center">
                      Start Your Journey
                      <RocketLaunchIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </motion.button>
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Video Modal */}
      <AnimatePresence>
        {isVideoPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsVideoPlaying(false)}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative max-w-4xl w-full aspect-video bg-gray-900 rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white text-center">
                  <BeakerIcon className="h-16 w-16 mx-auto mb-4 text-purple-400" />
                  <h3 className="text-2xl font-bold mb-2">Demo Coming Soon</h3>
                  <p className="text-gray-300">Interactive platform demo will be available shortly</p>
                </div>
              </div>
              <button
                onClick={() => setIsVideoPlaying(false)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                ×
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}