import { assets, footerLinks } from "../assets/assets";
import { Mail, Phone, MapPin, Heart } from "lucide-react";
import { motion } from "framer-motion";

// Custom brand SVG components since Lucide deprecated social logos
const FacebookIcon = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
)

const TwitterIcon = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
)

const InstagramIcon = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
)

const YoutubeIcon = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17z" />
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" />
  </svg>
)

const Footer = () => {
    // Map text to custom brand SVG components
    const getSocialIcon = (name) => {
        const classes = "w-4 h-4";
        switch (name.toLowerCase()) {
            case 'facebook':
                return <FacebookIcon className={classes} />;
            case 'twitter':
                return <TwitterIcon className={classes} />;
            case 'instagram':
                return <InstagramIcon className={classes} />;
            case 'youtube':
                return <YoutubeIcon className={classes} />;
            default:
                return null;
        }
    };

    return (
        <footer className="w-full bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200/60 dark:border-slate-800/60 px-6 md:px-16 lg:px-24 xl:px-32 mt-24 transition-colors duration-300">
            <div className="flex flex-col lg:flex-row items-start justify-between gap-12 py-16 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                
                {/* Brand Column */}
                <div className="flex flex-col gap-5 max-w-sm">
                    <img className="h-8 w-fit object-contain dark:brightness-0 dark:invert" src={assets.logo} alt="GreenCart" />
                    <p className="text-sm leading-relaxed mt-2 text-slate-500 dark:text-slate-400">
                        We deliver fresh organic groceries and daily essentials straight to your door. Trusted by thousands, we make shopping simple, affordable, and sustainable.
                    </p>
                    
                    {/* Contact details */}
                    <div className="flex flex-col gap-2.5 mt-2 text-sm text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                            <span>123 Organic Way, Eco Valley</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                            <span>+1 (555) 347-3867</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
                            <span>support@greencart.com</span>
                        </div>
                    </div>
                </div>

                {/* Links Columns */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-10 w-full lg:w-[55%]">
                    {footerLinks.map((section, index) => (
                        <div key={index} className="flex flex-col gap-4">
                            <h3 className="font-semibold text-sm tracking-wider uppercase text-slate-800 dark:text-slate-200">
                                {section.title}
                            </h3>
                            <ul className="flex flex-col gap-2.5 text-sm">
                                {section.links.map((link, i) => {
                                    const socialIcon = section.title.toLowerCase().includes('follow') ? getSocialIcon(link.text) : null;
                                    return (
                                        <li key={i}>
                                            <motion.a 
                                                whileHover={{ x: 3 }}
                                                href={link.url} 
                                                className="flex items-center gap-2 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors duration-200"
                                            >
                                                {socialIcon}
                                                <span>{link.text}</span>
                                            </motion.a>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            {/* Copyright */}
            <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 dark:text-slate-500">
                <p>
                    Copyright {new Date().getFullYear()} © GreenCart. All Rights Reserved.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
