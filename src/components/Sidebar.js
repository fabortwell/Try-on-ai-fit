import React from "react";
import { Upload, Image, Settings } from "lucide-react";

const Sidebar = () => {
  return (
    <div className="w-20 bg-darkBg flex flex-col items-center py-6 space-y-8 border-r border-grayText/20">
      <h1 className="text-primary font-bold text-lg">AI</h1>
      <nav className="flex flex-col items-center space-y-6 text-grayText">
        <button className="hover:text-primary transition-colors">
          <Upload size={22} />
        </button>
        <button className="hover:text-primary transition-colors">
          <Image size={22} />
        </button>
        <button className="hover:text-primary transition-colors">
          <Settings size={22} />
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;