import { SignUp } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";

const SignUpPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-200 opacity-20 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-20 w-40 h-40 bg-pink-200 opacity-20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-32 left-1/3 w-36 h-36 bg-purple-300 opacity-15 rounded-full blur-3xl"></div>
        <Sparkles className="absolute top-1/4 right-1/4 h-6 w-6 text-purple-300 opacity-30" />
        <Sparkles className="absolute bottom-1/3 left-1/4 h-5 w-5 text-pink-300 opacity-30" />
      </div>

      <div className="max-w-2xl w-full space-y-6 relative z-10">
        {/* Simple Header */}
        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-3 text-2xl font-bold mb-4 group"
          >
            <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all">
              <span className="text-white text-xl font-black">CBS</span>
            </div>
            <div className="text-left">
              <span className="block font-black">Charmé</span>
              <span className="block text-[10px] text-gray-600 font-semibold tracking-widest uppercase">
                For the C-Girlies
              </span>
            </div>
          </Link>
        </div>

        {/* Clerk Sign Up Component - Default Styling */}
        <div className="flex justify-center">
          <SignUp
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
            afterSignUpUrl="/dashboard"
          />
        </div>

        {/* Back to homepage link */}
        <div className="text-center">
          <Link
            to="/"
            className="text-gray-600 hover:text-orange-600 font-medium transition-colors group inline-flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
