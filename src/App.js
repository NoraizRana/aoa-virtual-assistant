import React from "react";
import Navbar from "./components/Navbar";
import ChatPage from "./pages/ChatPage";

function App() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      <ChatPage />
    </div>
  );
}

export default App;