import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Github, Heart } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-black/40 border-t border-white/5 backdrop-blur-sm pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

                {/* Brand */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                            <span className="font-bold text-white">Z</span>
                        </div>
                        <span className="text-xl font-bold text-white">ZOOM</span>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        Redefining the future of e-commerce with AI-driven personalization and immersive shopping experiences.
                    </p>
                    <div className="flex gap-4 pt-2">
                        <SocialIcon Icon={Twitter} />
                        <SocialIcon Icon={Instagram} />
                        <SocialIcon Icon={Linkedin} />
                        <SocialIcon Icon={Github} />
                    </div>
                </div>

                {/* Links */}
                <div>
                    <h4 className="font-bold text-white mb-6">Shop</h4>
                    <ul className="space-y-3 text-sm text-muted-foreground">
                        <FooterLink href="#">New Arrivals</FooterLink>
                        <FooterLink href="#">Electronics</FooterLink>
                        <FooterLink href="#">Fashion</FooterLink>
                        <FooterLink href="#">Accessories</FooterLink>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-white mb-6">Support</h4>
                    <ul className="space-y-3 text-sm text-muted-foreground">
                        <FooterLink href="#">Help Center</FooterLink>
                        <FooterLink href="#">Order Status</FooterLink>
                        <FooterLink href="#">Returns</FooterLink>
                        <FooterLink href="#">Contact Us</FooterLink>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-white mb-6">Newsletter</h4>
                    <p className="text-sm text-muted-foreground mb-4">Subscribe to get special offers and once-in-a-lifetime deals.</p>
                    <form className="flex gap-2">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm w-full focus:outline-none focus:border-primary transition-colors"
                        />
                        <button className="bg-primary text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                            Join
                        </button>
                    </form>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-xs text-muted-foreground">
                    &copy; 2026 ZOOM Commerce. All rights reserved.
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Designed with</span>
                    <Heart className="w-3 h-3 text-red-500 fill-red-500 animate-pulse" />
                    <span>by AI Assistant</span>
                </div>
            </div>
        </footer>
    );
};

const SocialIcon = ({ Icon }) => (
    <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all duration-300">
        <Icon className="w-4 h-4" />
    </a>
)

const FooterLink = ({ children, href }) => (
    <li>
        <a href={href} className="hover:text-primary transition-colors block transform hover:translate-x-1 duration-200">
            {children}
        </a>
    </li>
)

export default Footer;
