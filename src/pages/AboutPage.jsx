import { useState } from "react";
import {
  Heart,
  Award,
  Users,
  Sparkles,
  ShoppingBag,
  MapPin,
  Mail,
  Phone,
  Instagram,
  Facebook,
  Twitter,
  ArrowRight,
} from "lucide-react";

const AboutPage = () => {
  const [activeTab, setActiveTab] = useState("story");

  const stats = [
    { label: "Happy Customers", value: "5,000+", icon: Users },
    { label: "Jewelry Pieces", value: "10,000+", icon: ShoppingBag },
    { label: "Years of Excellence", value: "5+", icon: Award },
    { label: "5-Star Reviews", value: "4.8/5", icon: Sparkles },
  ];

  const values = [
    {
      icon: Heart,
      title: "Quality First",
      description:
        "Every piece is carefully crafted and inspected to meet our high standards. We source only authentic materials and work with skilled artisans.",
    },
    {
      icon: Award,
      title: "Authenticity Guaranteed",
      description:
        "All our jewelry comes with certificates of authenticity. We stand behind every piece we sell with our lifetime warranty.",
    },
    {
      icon: Users,
      title: "Customer-Centric",
      description:
        "Your satisfaction is our priority. From browsing to after-sales support, we're here to make your experience exceptional.",
    },
    {
      icon: Sparkles,
      title: "Timeless Elegance",
      description:
        "We curate pieces that transcend trends. Our collection features both classic designs and contemporary styles that last.",
    },
  ];

  const team = [
    {
      name: "Chioma Okafor",
      role: "Founder & Creative Director",
      image:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
      bio: "With over 10 years in fashion and jewelry design, Chioma founded our brand to celebrate African beauty and craftsmanship.",
    },
    {
      name: "Adebayo Williams",
      role: "Master Jeweler",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
      bio: "Trained in traditional goldsmithing, Adebayo brings three generations of jewelry-making expertise to every piece.",
    },
    {
      name: "Fatima Ibrahim",
      role: "Design Curator",
      image:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop",
      bio: "Fatima sources unique pieces from local and international designers, ensuring our collection stays fresh and exciting.",
    },
  ];

  const milestones = [
    {
      year: "2019",
      title: "The Beginning",
      description:
        "Started as a small boutique in Lekki, Lagos with a dream to redefine Nigerian jewelry.",
    },
    {
      year: "2020",
      title: "Online Expansion",
      description:
        "Launched our e-commerce platform, reaching customers across Nigeria.",
    },
    {
      year: "2022",
      title: "Award Recognition",
      description:
        "Won 'Best Jewelry Brand' at the Lagos Fashion & Design Week.",
    },
    {
      year: "2024",
      title: "Growing Strong",
      description:
        "Opened our second showroom in Victoria Island and partnered with international designers.",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-900 via-primary-800 to-primary-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-32 h-32 border border-white rounded-full"></div>
          <div className="absolute top-40 right-20 w-24 h-24 border border-white rounded-full"></div>
          <div className="absolute bottom-20 left-1/3 w-16 h-16 border border-white rounded-full"></div>
        </div>

        <div className="relative container-custom section-padding">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 animate-fade-in-up">
              Our Story: Crafting Beauty,{" "}
              <span className="gold-gradient">Creating Memories</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-100 mb-6 sm:mb-8 animate-fade-in-up">
              From Lagos to your heart, we're on a mission to make every woman
              feel special with timeless jewelry pieces.
            </p>
            <div className="flex items-center justify-center gap-2 text-gold-300 animate-fade-in-up">
              <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base md:text-lg">
                Proudly based in Lagos, Nigeria
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 sm:py-12 md:py-16 bg-gray-50">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="text-center p-4 sm:p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Icon className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 sm:mb-3 text-primary-600" />
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm md:text-base text-gray-600">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tabbed Content Section */}
      <section className="py-8 sm:py-12 md:py-16 lg:py-20">
        <div className="container-custom">
          {/* Tabs */}
          <div className="flex justify-center mb-8 sm:mb-12 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("story")}
              className={`px-4 sm:px-6 py-2 sm:py-3 font-semibold text-sm sm:text-base transition-colors ${
                activeTab === "story"
                  ? "text-primary-600 border-b-2 border-primary-600"
                  : "text-gray-600 hover:text-primary-600"
              }`}
            >
              Our Story
            </button>
            <button
              onClick={() => setActiveTab("values")}
              className={`px-4 sm:px-6 py-2 sm:py-3 font-semibold text-sm sm:text-base transition-colors ${
                activeTab === "values"
                  ? "text-primary-600 border-b-2 border-primary-600"
                  : "text-gray-600 hover:text-primary-600"
              }`}
            >
              Our Values
            </button>
            <button
              onClick={() => setActiveTab("team")}
              className={`px-4 sm:px-6 py-2 sm:py-3 font-semibold text-sm sm:text-base transition-colors ${
                activeTab === "team"
                  ? "text-primary-600 border-b-2 border-primary-600"
                  : "text-gray-600 hover:text-primary-600"
              }`}
            >
              Meet the Team
            </button>
          </div>

          {/* Our Story Tab */}
          {activeTab === "story" && (
            <div className="max-w-4xl mx-auto animate-fade-in">
              <div className="grid md:grid-cols-2 gap-6 sm:gap-8 items-center mb-8 sm:mb-12">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                    Where It All Began
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 leading-relaxed">
                    In the vibrant heart of Lagos, our founder Chioma Okafor had
                    a vision: to create a jewelry brand that celebrates the
                    modern Nigerian woman – confident, stylish, and
                    unapologetically herself.
                  </p>
                  <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 leading-relaxed">
                    What started as a small collection of handpicked pieces has
                    grown into one of Lagos's most trusted jewelry destinations.
                    We've stayed true to our roots while embracing contemporary
                    design, ensuring every piece tells a story of elegance and
                    authenticity.
                  </p>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Today, we're proud to serve thousands of customers across
                    Nigeria, each looking for that perfect piece to mark life's
                    special moments or simply to express their unique style.
                  </p>
                </div>
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=600&h=400&fit=crop"
                    alt="Jewelry crafting"
                    className="rounded-2xl shadow-xl"
                  />
                  <div className="absolute -bottom-4 -right-4 w-24 h-24 sm:w-32 sm:h-32 bg-gold-500 rounded-full opacity-20"></div>
                </div>
              </div>

              {/* Timeline */}
              <div className="mt-12 sm:mt-16">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">
                  Our Journey
                </h3>
                <div className="space-y-6 sm:space-y-8">
                  {milestones.map((milestone, index) => (
                    <div
                      key={milestone.year}
                      className="flex gap-4 sm:gap-6 items-start animate-fade-in-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-base sm:text-lg">
                          {milestone.year}
                        </div>
                      </div>
                      <div className="flex-1 pt-2">
                        <h4 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 sm:mb-2">
                          {milestone.title}
                        </h4>
                        <p className="text-sm sm:text-base text-gray-600">
                          {milestone.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Our Values Tab */}
          {activeTab === "values" && (
            <div className="max-w-5xl mx-auto animate-fade-in">
              <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                  What We Stand For
                </h2>
                <p className="text-sm sm:text-base md:text-lg text-gray-600">
                  These core values guide everything we do, from sourcing
                  materials to serving our customers.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
                {values.map((value, index) => {
                  const Icon = value.icon;
                  return (
                    <div
                      key={value.title}
                      className="card card-hover p-6 sm:p-8 animate-fade-in-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary-600 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                        <Icon className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                        {value.title}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                        {value.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Meet the Team Tab */}
          {activeTab === "team" && (
            <div className="max-w-5xl mx-auto animate-fade-in">
              <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                  The People Behind the Sparkle
                </h2>
                <p className="text-sm sm:text-base md:text-lg text-gray-600">
                  Meet the passionate team dedicated to bringing you the finest
                  jewelry.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {team.map((member, index) => (
                  <div
                    key={member.name}
                    className="card card-hover overflow-hidden animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4 sm:p-6">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                        {member.name}
                      </h3>
                      <p className="text-sm sm:text-base text-primary-600 font-medium mb-2 sm:mb-3">
                        {member.role}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                        {member.bio}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-8 sm:py-12 md:py-16 bg-gray-50">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                Visit Us or Get in Touch
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-600">
                We'd love to hear from you. Stop by our showrooms or reach out
                online.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
              {/* Showroom 1 */}
              <div className="card p-6 sm:p-8">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
                  Lekki Showroom
                </h3>
                <div className="space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-600">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary-600 mt-1 flex-shrink-0" />
                    <span>15 Admiralty Way, Lekki Phase 1, Lagos</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-primary-600 flex-shrink-0" />
                    <span>+234 803 123 4567</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-primary-600 flex-shrink-0" />
                    <span>lekki@jewelrystore.ng</span>
                  </div>
                  <p className="text-xs sm:text-sm pt-2">
                    <strong>Hours:</strong> Mon-Sat: 10am - 8pm, Sun: 12pm - 6pm
                  </p>
                </div>
              </div>

              {/* Showroom 2 */}
              <div className="card p-6 sm:p-8">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
                  Victoria Island Showroom
                </h3>
                <div className="space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-600">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary-600 mt-1 flex-shrink-0" />
                    <span>
                      Plot 1234 Adeola Odeku Street, Victoria Island, Lagos
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-primary-600 flex-shrink-0" />
                    <span>+234 803 765 4321</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-primary-600 flex-shrink-0" />
                    <span>vi@jewelrystore.ng</span>
                  </div>
                  <p className="text-xs sm:text-sm pt-2">
                    <strong>Hours:</strong> Mon-Sat: 10am - 8pm, Sun: 12pm - 6pm
                  </p>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="text-center mt-8 sm:mt-12">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
                Follow Our Journey
              </h3>
              <div className="flex justify-center gap-3 sm:gap-4">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-600 text-white rounded-full flex items-center justify-center hover:bg-primary-700 transition-colors"
                >
                  <Instagram className="h-4 w-4 sm:h-5 sm:w-5" />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-600 text-white rounded-full flex items-center justify-center hover:bg-primary-700 transition-colors"
                >
                  <Facebook className="h-4 w-4 sm:h-5 sm:w-5" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-600 text-white rounded-full flex items-center justify-center hover:bg-primary-700 transition-colors"
                >
                  <Twitter className="h-4 w-4 sm:h-5 sm:w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-primary-600 text-white">
        <div className="container-custom text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
            Ready to Find Your Perfect Piece?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-primary-100 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            Explore our collection and discover jewelry that speaks to your
            soul.
          </p>
          <a
            href="/products"
            className="btn-primary bg-white text-primary-600 hover:bg-gray-100 btn-lg inline-flex items-center gap-2 group"
          >
            Shop Now
            <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
