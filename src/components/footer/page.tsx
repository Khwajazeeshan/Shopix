"use client"

import React, { useState } from "react";
import Link from "next/link";
import { Mail, MapPin, Phone, Shield, Globe, X, Heart } from "lucide-react";
import { FaFacebook, FaTwitter, FaInstagram, FaGithub } from "react-icons/fa";

export default function Footer() {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"terms" | "privacy" | "catalog" | "security" | "help">("terms");

  const openModal = (type: typeof modalType) => {
    setModalType(type);
    setShowModal(true);
  };

  const footerLinks = {
    marketplace: [
      { name: "Our Catalog", action: () => openModal("catalog") },
      { name: "Order Tracking", href: "/products/my-orders" },
      { name: "Your Selection", href: "/cart" },
    ],
    support: [
      { name: "Security Center", action: () => openModal("security") },
      { name: "Privacy Policy", action: () => openModal("privacy") },
      { name: "Terms of Service", action: () => openModal("terms") },
      { name: "Help Center", action: () => openModal("help") },
    ],
    contact: [
      { icon: MapPin, text: "Silicon Valley Tech Hub, Phase 4" },
      { icon: Mail, text: "support@shopix.io" },
      { icon: Phone, text: "+1 (555) 000-7467" },
    ]
  };

  return (
    <footer className="bg-background border-t border-border mt-auto transition-colors">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 group w-fit">
              <div className="bg-primary/10 text-primary p-2 rounded-lg group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <Globe className="w-6 h-6" />
              </div>
              <span className="font-bold text-2xl tracking-tight text-foreground">Shopix</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              Redefining the shopping experience with curated premium goods and seamless transactions for the modern world.
            </p>
            <div className="flex gap-4 pt-2">
              {[
                { Icon: FaInstagram, href: "#" },
                { Icon: FaTwitter, href: "#" },
                { Icon: FaFacebook, href: "#" },
              ].map(({ Icon, href }, i) => (
                <a 
                  key={i} 
                  href={href}
                  className="bg-secondary text-secondary-foreground p-2 rounded-full hover:bg-primary hover:text-white transition-colors duration-300"
                  aria-label="Social Link"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4 lg:pl-8">
            <h4 className="font-semibold text-foreground text-lg">Marketplace</h4>
            <ul className="space-y-3">
              {footerLinks.marketplace.map((link, i) => (
                <li key={i}>
                  {link.action ? (
                    <button 
                      onClick={link.action}
                      className="text-muted-foreground hover:text-primary transition-colors text-sm hover:translate-x-1 inline-block transform duration-200"
                    >
                      {link.name}
                    </button>
                  ) : (
                    <Link 
                      href={link.href!}
                      className="text-muted-foreground hover:text-primary transition-colors text-sm hover:translate-x-1 inline-block transform duration-200"
                    >
                      {link.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground text-lg">Company</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link, i) => (
                <li key={i}>
                  <button 
                    onClick={link.action}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm hover:translate-x-1 inline-block transform duration-200"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground text-lg">Get in Touch</h4>
            <ul className="space-y-4">
              {footerLinks.contact.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="mt-0.5 text-primary">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <p className="text-muted-foreground text-sm leading-tight">{item.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 opacity-100 transition-opacity">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setShowModal(false)} 
          />
          <div className="relative bg-background rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100 opacity-100 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">
                {modalType === "terms" && "Terms & Conditions"}
                {modalType === "privacy" && "Privacy Policy"}
                {modalType === "catalog" && "Global Catalog"}
                {modalType === "security" && "Security Protocols"}
                {modalType === "help" && "Help & Support"}
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-muted-foreground hover:text-foreground hover:bg-muted p-2 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <p className="text-muted-foreground mb-6">
                At Shopix, we are committed to providing the highest quality of service and security to our users aligned with global standards.
              </p>
              
              <div className="bg-primary/5 rounded-xl p-5 mb-6 border border-primary/10">
                <h3 className="flex items-center gap-2 font-medium text-primary mb-3">
                  <Shield className="w-5 h-5" /> Core Principles
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/60" /> Data encryption at rest and in transit
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/60" /> Verified global merchant network
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/60" /> 24/7 automated fraud detection systems
                  </li>
                </ul>
              </div>
              
              <p className="text-muted-foreground text-sm">
                For more specific inquiries regarding your data and how we operate, please contact our support team.
              </p>
            </div>

            <div className="p-4 border-t border-border bg-muted/30 flex justify-end">
              <button 
                onClick={() => setShowModal(false)}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium shadow-sm"
              >
                Accept & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
