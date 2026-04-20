import React from "react";

const Navbar = () => {
  return (
    <nav className="bg-indigo-700 text-white px-6 py-4 flex items-center justify-between shadow-md">
      {/* Left: Logo + Title */}
      <div className="flex items-center gap-3">
        <span className="text-2xl">🧠</span>
        <div>
          <h1 className="text-lg font-bold leading-tight">AoA Assistant</h1>
          <p className="text-xs text-indigo-200">Analysis of Algorithms — AI Tutor</p>
        </div>
      </div>

      {/* Right: Nav links */}
      <div className="flex items-center gap-4 text-sm">
        <a href="/" className="hover:text-indigo-200 transition">Home</a>
        <a href="/topics" className="hover:text-indigo-200 transition">Topics</a>
        <a href="/progress" className="hover:text-indigo-200 transition">Progress</a>
        <button className="bg-white text-indigo-700 px-3 py-1 rounded-full font-semibold hover:bg-indigo-100 transition">
          Login
        </button>
      </div>
    </nav>
  );
};

export default Navbar;