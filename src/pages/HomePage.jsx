import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
ArrowRight,
Star,
Truck,
Shield,
RefreshCw,
Heart,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import productService from "../services/productService";
import { InlineLoading, CardSkeleton } from "../components/common/Loading";
import SignupModal from "../components/customer/SignupModal";

const HomePage = () => {
const { isAuthenticated } = useAuth();
const { addToCart } = useCart();

const [featuredProducts, setFeaturedProducts] = useState([]);
const [newArrivals, setNewArrivals] = useState([]);
const [isLoading, setIsLoading] = useState(true);
const [showSignupModal, setShowSignupModal] = useState(false);

// Load homepage data
useEffect(() => {
const loadHomepageData = async () => {
try {
setIsLoading(true);

// Load featured products and new arrivals in parallel
const [featuredResponse, newArrivalsResponse] = await Promise.all([
productService.getFeaturedProducts(8),
productService.getNewArrivals(8),
]);

if (featuredResponse.success) {
setFeaturedProducts(featuredResponse.data.products || []);
}

if (newArrivalsResponse.success) {
setNewArrivals(newArrivalsResponse.data.products || []);
}
} catch (error) {
console.error("Error loading homepage data:", error);
} finally {
setIsLoading(false);
}
};

loadHomepageData();
}, []);

// Show signup modal for new visitors
useEffect(() => {
if (!isAuthenticated) {
const hasSeenModal = sessionStorage.getItem("hasSeenSignupModal");
if (!hasSeenModal) {
const timer = setTimeout(() => {
setShowSignupModal(true);
sessionStorage.setItem("hasSeenSignupModal", "true");
}, 5000); // Show after 5 seconds

return () => clearTimeout(timer);
}
}
}, [isAuthenticated]);

const handleAddToCart = async (product) => {
const result = await addToCart(product, 1);
if (!result.success && !isAuthenticated) {
// Optionally show signup modal or login prompt
}
};

const categories = [
{
name: "Rings",
path: "/products?category=rings",
image: "/images/categories/rings.jpg",
description: "Elegant rings for every occasion",
},
{
name: "Necklaces",
path: "/products?category=necklaces",
image: "/images/categories/necklaces.jpg",
description: "Beautiful necklaces that fit you",
},
{
name: "Earrings",
path: "/products?category=earrings",
image: "/images/categories/earrings.jpg",
description: "Stunning earrings for you",
},
{
name: "Bracelets",
path: "/products?category=bracelets",
image: "/images/categories/bracelets.jpg",
description: "Delicate bracelets for any wrist",
},
];

const features = [
{
icon: Truck,
title: "Free Shipping",
description: "Free delivery on orders over ₦50,000",
},
{
icon: Shield,
title: "Secure Payment",
description: "Your payment information is safe with us",
},
{
icon: RefreshCw,
title: "Easy Returns",
description: "30-day return policy on all items",
},
{
icon: Star,
title: "Quality Guarantee",
description: "Authentic jewelry with lifetime warranty",
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

<div className="relative container-custom lg:mt-12 section-padding lg:!p-12">
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
<div className="space-y-6 md:space-y-8 animate-fade-in-up">
<div className="space-y-3 md:space-y-4">
<h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
Meaningful Everyday <span className="gold-gradient">Jewelry</span> for the C-Girlies
</h1>
<p className="text-lg sm:text-xl text-gray-100 leading-relaxed max-w-lg">
Discover our curated collection of elegant jewelry pieces designed
to celebrate your unique style and tell your story.
</p>
</div>

<div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
<Link
to="/products"
className="btn-primary btn-lg inline-flex items-center justify-center gap-2 group"
>
Shop Collection
<ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
</Link>
<Link
to="/about"
className="btn-outline border-white text-white hover:bg-white hover:text-primary-600 btn-lg"
>
Our Story
</Link>
</div>

{/* Special Offer */}
<div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white border-opacity-20">
<div className="flex items-center gap-3 mb-2">
<div className="w-8 h-8 bg-gold-500 rounded-full flex items-center justify-center">
<span className="text-white text-sm font-bold">%</span>
</div>
<h3 className="text-base sm:text-lg font-semibold">Special Offer for New Customers</h3>
</div>
<p className="text-gray-100 mb-3 text-sm sm:text-base">
Get 10% off your first order when you sign up for our newsletter
</p>
<button
onClick={() => setShowSignupModal(true)}
className="text-gold-300 hover:text-gold-200 font-medium text-sm"
>
Claim Discount →
</button>
</div>
</div>

{/* Hero Image */}
<div className="relative animate-fade-in-up lg:animate-fade-in-right">
<div className="aspect-square bg-white bg-opacity-10 rounded-3xl overflow-hidden">
<img
src="/images/hero-jewelry.jpg"
alt="Beautiful jewelry collection"
className="w-full h-full object-cover"
onError={(e) => {
e.target.src = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
}}
/>
</div>

{/* Floating Elements */}
<div className="absolute -top-4 -right-4 w-16 h-16 sm:w-24 sm:h-24 bg-gold-500 rounded-full flex items-center justify-center animate-bounce-subtle">
<Heart className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
</div>
<div className="absolute -bottom-4 -left-4 w-12 h-12 sm:w-16 sm:h-16 bg-primary-600 rounded-full flex items-center justify-center">
<Star className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
</div>
</div>
</div>
</div>
</section>

{/* Features Section */}
<section className="py-8 sm:py-12 md:py-16 bg-white">
<div className="container-custom">
<div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
{features.map((feature, index) => (
<div
key={feature.title}
className="text-center group animate-fade-in-up"
style={{ animationDelay: `${index * 0.1}s` }}
>
<div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto mb-2 sm:mb-3 md:mb-4 bg-primary-100 rounded-full flex items-center justify-center group-hover:bg-primary-600 transition-colors">
<feature.icon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary-600 group-hover:text-white" />
</div>
<h3 className="text-xs sm:text-sm md:text-base font-semibold text-gray-900 mb-1 sm:mb-2">
{feature.title}
</h3>
<p className="text-gray-600 text-[10px] sm:text-xs md:text-sm leading-tight">
{feature.description}
</p>
</div>
))}
</div>
</div>
</section>

{/* Categories Section */}
<section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-gray-50">
<div className="container-custom">
<div className="text-center mb-6 sm:mb-8 md:mb-12">
<h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4">
Shop by Category
</h2>
<p className="text-gray-600 text-xs sm:text-sm md:text-base max-w-2xl mx-auto px-4">
Explore our carefully curated collections, each piece selected for
its beauty, quality, and timeless appeal.
</p>
</div>

<div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
{categories.map((category, index) => (
<Link
key={category.name}
to={category.path}
className="group animate-fade-in-up"
style={{ animationDelay: `${index * 0.1}s` }}
>
<div className="card card-hover overflow-hidden">
<div className="aspect-square overflow-hidden rounded-lg mb-2 sm:mb-3 md:mb-4">
<img
src={category.image}
alt={category.name}
className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
onError={(e) => {
e.target.src =
"https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80";
}}
/>
</div>
<h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-1 sm:mb-2 group-hover:text-primary-600 transition-colors">
{category.name}
</h3>
<p className="text-gray-600 text-[10px] sm:text-xs md:text-sm mb-2 sm:mb-3 md:mb-4">
{category.description}
</p>
<div className="flex items-center text-primary-600 font-medium text-xs sm:text-sm">
Shop Now
<ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />
</div>
</div>
</Link>
))}
</div>
</div>
</section>

{/* Featured Products */}
<section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-white">
<div className="container-custom">
<div className="text-center mb-6 sm:mb-8 md:mb-12">
<h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4">
Featured Collection
</h2>
<p className="text-gray-600 text-xs sm:text-sm md:text-base max-w-2xl mx-auto px-4">
Handpicked pieces that embody elegance and sophistication. These
are our most loved items by customers.
</p>
</div>

{isLoading ? (
<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
<CardSkeleton count={8} />
</div>
) : (
<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
{featuredProducts.slice(0, 8).map((product, index) => (
<div
key={product._id}
className="card card-hover animate-fade-in-up"
style={{ animationDelay: `${index * 0.1}s` }}
>
<div className="relative aspect-square overflow-hidden rounded-lg mb-2 sm:mb-3 md:mb-4 group">
<img
src={product.primaryImage?.url || product.images[0]?.url}
alt={product.name}
className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
onError={(e) => {
e.target.src =
"https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80";
}}
/>

{product.isNewStock && (
<span className="absolute top-1.5 sm:top-2 md:top-3 left-1.5 sm:left-2 md:left-3 bg-green-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-medium">
New
</span>
)}

{product.isOnSale && (
<span className="absolute top-1.5 sm:top-2 md:top-3 right-1.5 sm:right-2 md:right-3 bg-red-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-medium">
Sale
</span>
)}

{/* Quick Add to Cart - Hidden on mobile */}
<div className="hidden sm:flex absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center">
<button
onClick={(e) => {
e.preventDefault();
handleAddToCart(product);
}}
className="btn-primary text-xs md:text-sm px-3 py-2"
>
Add to Cart
</button>
</div>
</div>

<div>
<h3 className="font-semibold text-gray-900 mb-1.5 sm:mb-2 line-clamp-2 text-xs sm:text-sm md:text-base">
{product.name}
</h3>
<div className="flex items-center justify-between flex-wrap gap-1">
<div className="flex items-center gap-1 sm:gap-2 flex-wrap">
{product.originalPrice &&
product.originalPrice > product.price && (
<span className="text-[10px] sm:text-xs md:text-sm text-gray-500 line-through">
₦{product.originalPrice.toLocaleString()}
</span>
)}
<span className="text-sm sm:text-base md:text-lg font-bold text-primary-600">
₦{product.price.toLocaleString()}
</span>
</div>

{product.reviews?.averageRating > 0 && (
<div className="flex items-center gap-0.5 sm:gap-1">
<Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 fill-current" />
<span className="text-[10px] sm:text-xs md:text-sm text-gray-600">
{product.reviews.averageRating.toFixed(1)}
</span>
</div>
)}
</div>
</div>
</div>
))}
</div>
)}

<div className="text-center mt-6 sm:mt-8 md:mt-12">
<Link
to="/products"
className="btn-primary btn-lg px-6 py-3 text-sm sm:text-base inline-block"
>
View All Products
</Link>
</div>
</div>
</section>

{/* New Arrivals */}
{newArrivals.length > 0 && (
<section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-gray-50">
<div className="container-custom">
<div className="text-center mb-6 sm:mb-8 md:mb-12">
<h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4">
New Arrivals
</h2>
<p className="text-gray-600 text-xs sm:text-sm md:text-base max-w-2xl mx-auto px-4">
Fresh additions to our collection. Be the first to discover
these beautiful new pieces.
</p>
</div>

<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
{newArrivals.slice(0, 4).map((product, index) => (
<div
key={product._id}
className="card card-hover animate-fade-in-up"
style={{ animationDelay: `${index * 0.1}s` }}
>
<div className="relative aspect-square overflow-hidden rounded-lg mb-2 sm:mb-3 md:mb-4 group">
<img
src={product.primaryImage?.url || product.images[0]?.url}
alt={product.name}
className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
onError={(e) => {
e.target.src =
"https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80";
}}
/>

<span className="absolute top-1.5 sm:top-2 md:top-3 left-1.5 sm:left-2 md:left-3 bg-green-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-medium">
New
</span>

{/* Quick Add to Cart - Hidden on mobile */}
<div className="hidden sm:flex absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center">
<button
onClick={(e) => {
e.preventDefault();
handleAddToCart(product);
}}
className="btn-primary text-xs md:text-sm px-3 py-2"
>
Add to Cart
</button>
</div>
</div>

<div>
<h3 className="font-semibold text-gray-900 mb-1.5 sm:mb-2 line-clamp-2 text-xs sm:text-sm md:text-base">
{product.name}
</h3>
<div className="flex items-center justify-between flex-wrap gap-1">
<span className="text-sm sm:text-base md:text-lg font-bold text-primary-600">
₦{product.price.toLocaleString()}
</span>

{product.reviews?.averageRating > 0 && (
<div className="flex items-center gap-0.5 sm:gap-1">
<Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 fill-current" />
<span className="text-[10px] sm:text-xs md:text-sm text-gray-600">
{product.reviews.averageRating.toFixed(1)}
</span>
</div>
)}
</div>
</div>
</div>
))}
</div>

<div className="text-center mt-6 sm:mt-8 md:mt-12">
<Link
to="/products?new=true"
className="btn-outline px-6 py-3 text-sm sm:text-base inline-block"
>
View All New Arrivals
</Link>
</div>
</div>
</section>
)}

{/* Newsletter CTA */}
<section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-primary-600 text-white">
<div className="container-custom text-center">
<div className="max-w-2xl mx-auto px-4">
<h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">
Stay in the Loop
</h2>
<p className="text-sm sm:text-base md:text-lg text-primary-100 mb-6 sm:mb-8">
Be the first to know about new collections, exclusive offers, and
styling tips delivered straight to your inbox.
</p>

<button
onClick={() => setShowSignupModal(true)}
className="btn-secondary bg-white text-primary-600 hover:bg-gray-100 btn-lg px-6 py-3 text-sm sm:text-base inline-block"
>
Join Our Newsletter
</button>

<p className="text-primary-200 text-xs sm:text-sm mt-3 sm:mt-4">
Plus get 10% off your first order!
</p>
</div>
</div>
</section>

{/* Signup Modal */}
<SignupModal
isOpen={showSignupModal}
onClose={() => setShowSignupModal(false)}
/>
</div>
);
};

export default HomePage;