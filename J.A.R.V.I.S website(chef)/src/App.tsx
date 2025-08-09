import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { Dashboard } from "./components/Dashboard";
import { useState } from "react";

export default function App() {
  const [currentView, setCurrentView] = useState("dashboard");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Authenticated>
        <Dashboard currentView={currentView} setCurrentView={setCurrentView} />
      </Authenticated>
      
      <Unauthenticated>
        <div className="min-h-screen flex flex-col">
          <header className="sticky top-0 z-10 bg-white/10 backdrop-blur-md h-16 flex justify-between items-center border-b border-white/20 shadow-lg px-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">J</span>
              </div>
              <h2 className="text-xl font-semibold text-white">JARVIS</h2>
            </div>
          </header>
          
          <main className="flex-1 flex items-center justify-center p-8">
            <div className="w-full max-w-md mx-auto">
              <Content />
            </div>
          </main>
        </div>
      </Unauthenticated>
      
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: 'white',
          },
        }}
      />
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl">
            <span className="text-white font-bold text-2xl">J</span>
          </div>
        </div>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
          JARVIS
        </h1>
        <p className="text-lg text-gray-300 mb-2">Just A Rather Very Intelligent System</p>
        <Authenticated>
          <p className="text-xl text-blue-300">
            Welcome back, {loggedInUser?.email ?? "friend"}!
          </p>
        </Authenticated>
        <Unauthenticated>
          <p className="text-xl text-gray-300">Sign in to access your AI assistant</p>
        </Unauthenticated>
      </div>

      <Unauthenticated>
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl">
          <SignInForm />
        </div>
      </Unauthenticated>
    </div>
  );
}
