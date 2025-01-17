import React from 'react';
import TopBar from './pages/components/Home/TopBar';
import LeftPanel from './pages/components/Home/LeftPanel';
import RightPanel from './pages/components/Home/RightPanel';
import MidPanel from './pages/components/Home/MidPanel';

function Home() {
  return (
    <div className="h-screen flex flex-col w-screen bg-home-divider">
      {/* Top Bar */}
      <div className="flex-shrink-0">
        <TopBar />
      </div>
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel */}
        <div className="hidden md:block w-72 flex-shrink-0 overflow-y-auto">
          <LeftPanel />
        </div>
        {/* Middle Panel */}
        <div className="flex-1 overflow-y-auto p-2 h-full"> {/* Ensure middle panel takes full available height */}
          <MidPanel />
        </div>
        {/* Right Panel */}
        <div className="hidden lg:block w-72 flex-shrink-0 overflow-y-auto">
          <RightPanel />
        </div>
      </div>
    </div>
  );
}

export default Home;
