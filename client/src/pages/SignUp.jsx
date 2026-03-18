import React from "react";
import { assets } from "../assets/assets";
import { Star } from "lucide-react";
import { SignUp } from "@clerk/clerk-react";

function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row relative overflow-hidden">
      
      {/* Background Image */}
      <img
        src={assets.bgImage}
        alt="Background"
        className="absolute top-0 left-0 -z-1 w-full h-full object-cover"
      />

      {/* Left Section */}
      <div className="flex-1 flex flex-col items-start justify-between p-6 md:p-10 lg:pl-40 z-10">
        <img src={assets.logo} alt="Logo" className="h-12 object-contain" />
        <div>
          <div className="flex items-center gap-3 mb-4 max-md:mt-10 bg-white/50 px-4 py-2 rounded-full shadow-sm w-fit border border-gray-200">
            <img src={assets.group_users} alt="Users" className="h-8 md:h-10" />
            <div>
              <div className="flex gap-1 mb-1">
                {Array(5).fill(0).map((_, i) => (
                  <Star key={i} className="size-4 text-amber-500 fill-amber-500" />
                ))}
              </div>
              <p className="text-sm font-medium text-gray-700">Used by over 1.2B+ users</p>
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl md:pb-2 font-bold bg-linear-to-r from-indigo-950 to-indigo-800 bg-clip-text text-transparent leading-tight">
            More Than just friends, <br /> truly connect.
          </h1>
          <p className="text-xl md:text-3xl text-indigo-900 max-w-72 md:max-w-md mt-4">
            Connect with a global community on pingup.
          </p>
        </div>
        <span className="md:m-10"></span>
      </div>

      {/* Right Section - Sign Up Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 z-10">
        <SignUp 
          routing="hash" 
          signInUrl="/" // Tells Clerk to go back to Login.jsx if they click "Sign in"
          appearance={{
            layout: {
              logoImageUrl: assets.logo,
              socialButtonsPlacement: "top",
              logoPlacement: "inside",
            },
            variables: {
              colorPrimary: '#4f46e5',
              colorBackground: '#ffffff',
              colorText: '#111827',
              colorInputBackground: '#f9fafb',
              colorInputText: '#111827',
              borderRadius: '0.75rem', 
              spacingUnit: '1.2rem', 
            },
            elements: {
              rootBox: "w-full max-w-[580px]", 
              cardBox: "shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 rounded-2xl w-full", 
              card: "bg-white p-8 sm:p-10 w-full",
              logoBox: "flex justify-center mb-6 w-full", 
              logoImage: "h-24 w-auto object-contain", 
              headerTitle: "text-3xl font-extrabold text-gray-900 tracking-tight",
              headerSubtitle: "text-base text-gray-500 mt-2",
              socialButtonsBlockButton: "w-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all font-medium py-3.5 shadow-sm rounded-xl",
              socialButtonsBlockButtonText: "text-gray-800 font-semibold text-base",
              dividerRow: "my-1",
              dividerLine: "bg-gray-200",
              dividerText: "text-gray-400 text-sm font-medium px-4",
              formFieldLabel: "text-gray-700 font-semibold text-sm mb-1.5",
              formFieldInput: "w-full bg-gray-50/50 border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-gray-900 transition-all py-3.5 px-4 text-base rounded-xl",
              formButtonPrimary: "w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 text-base font-bold transition-all py-3.5 mt-4 rounded-xl",
              footer: "bg-white border-t border-gray-100",
              footerActionText: "text-gray-500 text-base",
              footerActionLink: "text-indigo-600 hover:text-indigo-700 font-bold text-base",
              watermarkBox: "hidden", 
            }
          }}
        />
      </div>

    </div>
  );
}

export default SignUpPage;