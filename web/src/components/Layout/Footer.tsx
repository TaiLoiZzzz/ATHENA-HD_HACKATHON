'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';

const footerLinks = {
  platform: [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Services', href: '/services' },
    { name: 'Transactions', href: '/transactions' },
  ],
  services: [
    { name: 'Vietjet Airlines', href: '/services/vietjet' },
    { name: 'HDBank', href: '/services/hdbank' },
    { name: 'Resorts & Hotels', href: '/services/resorts' },
    { name: 'Insurance', href: '/services/insurance' },
  ],
  support: [
    { name: 'Help Center', href: '/help' },
    { name: 'Contact Us', href: '/contact' },
    { name: 'API Documentation', href: '/docs' },
    { name: 'System Status', href: '/status' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Cookie Policy', href: '/cookies' },
    { name: 'Blockchain Terms', href: '/blockchain-terms' },
  ],
};

const socialLinks = [
  {
    name: 'Facebook',
    href: '#',
    icon: (props: any) => (
      <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
        <path
          fillRule="evenodd"
          d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    name: 'Twitter',
    href: '#',
    icon: (props: any) => (
      <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
      </svg>
    ),
  },
  {
    name: 'LinkedIn',
    href: '#',
    icon: (props: any) => (
      <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
        <path
          fillRule="evenodd"
          d="M19 0H5a5 5 0 00-5 5v14a5 5 0 005 5h14a5 5 0 005-5V5a5 5 0 00-5-5zM8 19H5V8h3v11zM6.5 6.732c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zM20 19h-3v-5.604c0-3.368-4-3.113-4 0V19h-3V8h3v1.765c1.396-2.586 7-2.777 7 2.476V19z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container-athena py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold text-gradient-token mb-4">
                ATHENA Platform
              </h3>
              <p className="text-gray-300 mb-6 max-w-md">
                Transform your rewards into tradable SOV-Tokens with our revolutionary 
                super-app ecosystem powered by blockchain technology.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-center space-x-3">
                  <MapPinIcon className="w-4 h-4 text-primary-400" />
                  <span>123 Nguyen Hue Street, District 1, Ho Chi Minh City</span>
                </div>
                <div className="flex items-center space-x-3">
                  <PhoneIcon className="w-4 h-4 text-primary-400" />
                  <span>+84 (0) 28 1234 5678</span>
                </div>
                <div className="flex items-center space-x-3">
                  <EnvelopeIcon className="w-4 h-4 text-primary-400" />
                  <span>support@athena-platform.com</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex space-x-4 mt-6">
                {socialLinks.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    <span className="sr-only">{item.name}</span>
                    <item.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Platform Links */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h4 className="text-lg font-semibold mb-4">Platform</h4>
              <ul className="space-y-2">
                {footerLinks.platform.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Services Links */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h4 className="text-lg font-semibold mb-4">Services</h4>
              <ul className="space-y-2">
                {footerLinks.services.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Support & Legal Links */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 mb-6">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>

              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-sm text-gray-400"
            >
              <p>© {new Date().getFullYear()} ATHENA Platform by Sovico Group. All rights reserved.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              viewport={{ once: true }}
              className="flex items-center space-x-6 text-sm text-gray-400"
            >
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
                <span>System Status: Operational</span>
              </div>
              <div>
                Version 1.0.0
              </div>
            </motion.div>
          </div>
        </div>

        {/* Sovico Group Branding */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <p className="text-sm text-gray-400 mb-2">
              Powered by
            </p>
            <div className="flex justify-center items-center space-x-8 text-xs text-gray-500">
              <span className="service-vietjet font-semibold">Vietjet Airlines</span>
              <span className="text-gray-600">•</span>
              <span className="service-hdbank font-semibold">HDBank</span>
              <span className="text-gray-600">•</span>
              <span className="service-resort font-semibold">Resorts</span>
              <span className="text-gray-600">•</span>
              <span className="service-insurance font-semibold">Insurance</span>
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}

