import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube,
  Mail,
  Phone,
  MapPin,
  Send
} from 'lucide-react';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubscribing(true);
    try {
      // Add newsletter subscription API call here
      console.log('Newsletter subscription:', email);
      setEmail('');
      // You could show a success toast here
    } catch (error) {
      console.error('Newsletter subscription error:', error);
    } finally {
      setIsSubscribing(false);
    }
  };

  const productCategories = [
    { name: 'Rings', path: '/products?category=rings' },
    { name: 'Necklaces', path: '/products?category=necklaces' },
    { name: 'Earrings', path: '/products?category=earrings' },
    { name: 'Bracelets', path: '/products?category=bracelets' },
    { name: 'Pendants', path: '/products?category=pendants' },
    { name: 'Chains', path: '/products?category=chains' },
  ];

  const customerService = [
    { name: 'Contact Us', path: '/contact' },
    { name: 'Size Guide', path: '/size-guide' },
    { name: 'Shipping & Returns', path: '/shipping-returns' },
    { name: 'FAQ', path: '/faq' },
  ];

  const companyInfo = [
    { name: 'About Us', path: '/about' },
    { name: 'Privacy Policy', path: '/privacy-policy' },
    { name: 'Terms of Service', path: '/terms-of-service' },
    
  ];

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com/', label: 'Facebook' },
    { icon: Instagram, href: 'https://instagram.com/', label: 'Instagram' },
    { icon: Twitter, href: 'https://twitter.com/', label: 'Twitter' },
    { icon: Youtube, href: 'https://youtube.com/', label: 'YouTube' },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer Content */}
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-white mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">CBS</span>
              </div>
              <span className="gold-gradient">CHARMÉ</span>
            </Link>
            
            <p className="text-gray-400 mb-6 leading-relaxed">
              Discover meaningful everyday jewelry crafted for the modern C-girl. 
              Quality pieces that tell your story and celebrate your unique style.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-primary-600" />
                <span className="text-sm">Lagos, Nigeria</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-primary-600" />
                <span className="text-sm">+2348102963070</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-primary-600" />
                <span className="text-sm">info@cbs-jewelry.com</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4 mt-6">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors group"
                  aria-label={label}
                >
                  <Icon className="h-5 w-5 text-gray-400 group-hover:text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* Product Categories */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6">Shop Categories</h3>
            <ul className="space-y-3">
              {productCategories.map((category) => (
                <li key={category.path}>
                  <Link
                    to={category.path}
                    className="text-gray-400 hover:text-primary-400 transition-colors"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6">Customer Service</h3>
            <ul className="space-y-3">
              {customerService.map((service) => (
                <li key={service.path}>
                  <Link
                    to={service.path}
                    className="text-gray-400 hover:text-primary-400 transition-colors"
                  >
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter & Company */}
          <div>
          

            {/* Company Links */}
            <div>
              <h4 className="text-white font-medium mb-4">Company</h4>
              <ul className="space-y-2">
                {companyInfo.map((info) => (
                  <li key={info.path}>
                    <Link
                      to={info.path}
                      className="text-gray-400 hover:text-primary-400 transition-colors text-sm"
                    >
                      {info.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="border-t border-gray-800">
        <div className="container-custom py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-gray-400 text-sm">We Accept:</span>
              <div className="flex items-center gap-3">
                {/* Payment method icons - you can replace these with actual payment provider logos */}
                <div className="bg-white rounded px-2 py-1">
                  <span className="text-xs font-bold text-gray-900">VISA</span>
                </div>
                <div className="bg-white rounded px-2 py-1">
                  <span className="text-xs font-bold text-gray-900">MC</span>
                </div>
                <div className="bg-white rounded px-2 py-1">
                  <span className="text-xs font-bold text-gray-900">PayStack</span>
                </div>
                <div className="bg-white rounded px-2 py-1">
                  <span className="text-xs font-bold text-gray-900">Flutterwave</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-400">
              <span>🔒 Secure Payment</span>
              <span>🚚 Fast Delivery</span>
              <span>↩️ Easy Returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800">
        <div className="container-custom py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-gray-400 text-sm">
              © {new Date().getFullYear()} CHARMÉ. All rights reserved.
            </div>
            
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <Link to="/privacy-policy" className="hover:text-primary-400 transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms-of-service" className="hover:text-primary-400 transition-colors">
                Terms of Service
              </Link>
              <Link to="/cookies-policy" className="hover:text-primary-400 transition-colors">
                Cookies Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;