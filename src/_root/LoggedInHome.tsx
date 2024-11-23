import React from 'react';
import TopBar from './pages/components/LoggedInHome/TopBar';
import LeftPanel from './pages/components/LoggedInHome/LeftPanel';
import RightPanel from './pages/components/LoggedInHome/RightPanel';
import MidPanel from './pages/components/LoggedInHome/MidPanel';
import { useUser } from '@/contexts/UserContext';

const LoggedInHome: React.FC = () => {
  const { user } = useUser(); // Access user from context
  console.log('User', user);

  if (!user) {
    return <div>Loading...</div>; // Or show login screen
  }

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

        {/* Middle Panel - Fixed size and centered */}
        <div className="flex-1 flex justify-center items-start overflow-y-auto middle-part">
          <div className="w-[700px] max-w-full"> {/* Fixed width for middle panel */}
            <MidPanel />
          </div>
        </div>

        {/* Right Panel */}
        <div className="hidden lg:block w-72 flex-shrink-0 overflow-y-auto">
          <RightPanel />
        </div>
      </div>
    </div>
  );
};

export default LoggedInHome;
