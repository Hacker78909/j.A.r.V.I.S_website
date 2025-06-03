import { Authenticated, Unauthenticated } from "convex/react";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Dashboard } from "./components/Dashboard";
import { Toaster } from "sonner";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-900">
      <Authenticated>
        <header className="sticky top-0 z-10 bg-gray-800/80 backdrop-blur-sm p-4 flex justify-between items-center border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center border border-blue-500/50">
              <span className="text-2xl">🤖</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">J.A.R.V.I.S</h2>
              <p className="text-xs text-gray-400">Just A Rather Very Intelligent System</p>
            </div>
          </div>
          <SignOutButton />
        </header>
        <main className="flex-1">
          <Dashboard />
        </main>
      </Authenticated>
      <Unauthenticated>
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <div className="w-full max-w-md p-8 bg-gray-800 rounded-2xl shadow-2xl border border-gray-700">
            <div className="text-center mb-8">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-blue-600/20 flex items-center justify-center border-2 border-blue-500/50">
                <span className="text-5xl">🤖</span>
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
                J.A.R.V.I.S
              </h1>
              <p className="text-xl text-gray-400 font-medium">
                Just A Rather Very Intelligent System
              </p>
              <div className="mt-4 text-sm text-gray-500">
                Welcome back, sir. Please authenticate to access your systems.
              </div>
            </div>
            <SignInForm />
          </div>
        </div>
      </Unauthenticated>
      <Toaster />
    </div>
  );
}
