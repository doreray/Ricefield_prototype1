import React from 'react';
import TopBar from './pages/components/LoggedInHome/TopBar';
import LeftPanel from './pages/components/LoggedInHome/LeftPanel';
import RightPanel from './pages/components/LoggedInHome/RightPanel';
import MidPanel from './pages/components/LoggedInHome/MidPanel';

function LoggedInHome() {
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
        <div className="flex-1 overflow-y-auto p-2">
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

export default LoggedInHome;
