'use client';

import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ReactNode } from 'react';

// Smooth page transitions
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1
  },
  out: {
    opacity: 0,
    y: -20,
    scale: 1.02
  }
};

export const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4
};

// Card hover effects
export const cardVariants: Variants = {
  rest: {
    scale: 1,
    y: 0,
    transition: {
      duration: 0.2,
      type: "tween",
      ease: "easeInOut"
    }
  },
  hover: {
    scale: 1.03,
    y: -8,
    transition: {
      duration: 0.2,
      type: "tween",
      ease: "easeInOut"
    }
  },
  tap: {
    scale: 0.98,
    y: 0
  }
};

// Stagger animations for lists
export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.1
    }
  }
};

export const itemVariants: Variants = {
  hidden: { 
    y: 20, 
    opacity: 0,
    scale: 0.95
  },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  }
};

// Modal animations
export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 50
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: 50,
    transition: {
      duration: 0.2
    }
  }
};

export const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

// Smooth scroll reveal
interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
}

export const ScrollReveal = ({ 
  children, 
  delay = 0, 
  direction = 'up',
  className = '' 
}: ScrollRevealProps) => {
  const directionOffset = {
    up: { y: 40 },
    down: { y: -40 },
    left: { x: 40 },
    right: { x: -40 }
  };

  return (
    <motion.div
      className={className}
      initial={{
        opacity: 0,
        ...directionOffset[direction]
      }}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0
      }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.6,
        delay,
        type: "spring",
        stiffness: 100
      }}
    >
      {children}
    </motion.div>
  );
};

// Floating animation
interface FloatingProps {
  children: ReactNode;
  intensity?: number;
  speed?: number;
  className?: string;
}

export const Floating = ({ 
  children, 
  intensity = 10, 
  speed = 4,
  className = '' 
}: FloatingProps) => {
  return (
    <motion.div
      className={className}
      animate={{
        y: [-intensity, intensity, -intensity],
      }}
      transition={{
        duration: speed,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  );
};

// Smooth button component
interface SmoothButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

export const SmoothButton = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = ''
}: SmoothButtonProps) => {
  const baseClasses = "relative overflow-hidden font-medium transition-all duration-200 rounded-xl";
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:shadow-xl",
    secondary: "bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20",
    ghost: "text-white hover:bg-white/10"
  };

  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };

  return (
    <motion.button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      onClick={disabled ? undefined : onClick}
      whileHover={disabled ? {} : { scale: 1.02, y: -2 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      disabled={disabled}
    >
      <span className="relative z-10">{children}</span>
      
      {/* Ripple effect */}
      {!disabled && (
        <motion.div
          className="absolute inset-0 bg-white/20 rounded-xl"
          initial={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.button>
  );
};

// Page transition wrapper
interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export const PageTransition = ({ children, className = '' }: PageTransitionProps) => {
  return (
    <motion.div
      className={className}
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      {children}
    </motion.div>
  );
};

// Smooth modal
interface SmoothModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const SmoothModal = ({
  isOpen,
  onClose,
  children,
  title,
  size = 'md'
}: SmoothModalProps) => {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className={`relative w-full ${sizeClasses[size]} bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden`}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header */}
            {title && (
              <div className="px-6 py-4 border-b border-white/10">
                <h3 className="text-xl font-bold text-white">{title}</h3>
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                >
                  ×
                </button>
              </div>
            )}

            {/* Content */}
            <div className="p-6">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// Smooth card component
interface SmoothCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export const SmoothCard = ({
  children,
  className = '',
  hover = true,
  onClick
}: SmoothCardProps) => {
  return (
    <motion.div
      className={`bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 ${className} ${
        onClick ? 'cursor-pointer' : ''
      }`}
      variants={hover ? cardVariants : undefined}
      initial="rest"
      whileHover={hover ? "hover" : undefined}
      whileTap={hover ? "tap" : undefined}
      onClick={onClick}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.div>
  );
};

