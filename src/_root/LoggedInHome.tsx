import React, { useState } from 'react';
import TopBar from './pages/components/LoggedInHome/TopBar';
import LeftPanel from './pages/components/LoggedInHome/LeftPanel';
import RightPanel from './pages/components/LoggedInHome/RightPanel/RightPanel';
import { useLocation } from 'react-router-dom';
import MidPanel from './pages/components/LoggedInHome/MidPanel/MidPanel';
import ReplyPanel from './pages/components/LoggedInHome/MidPanel/ReplyPanel';
import UserProfile from './pages/components/LoggedInHome/MidPanel/UserPanel/UserProfile';
import { useUser } from '@/contexts/UserContext';

const LoggedInHome: React.FC = () => {
  const { user } = useUser(); // Access user from context
  const [filteredSpace, setFilteredSpace] = useState<string>('');
  const location = useLocation(); // Get the current route

  if (!user) {
    return <div>Loading...</div>; // Or show login screen
  }

  // Define the list of valid spaces
  const validSpaces = ['confession', 'memes', 'news', 'questions', 'rant'];

  // Determine which panel to display based on the route
  const isReplyRoute = validSpaces.some((space) =>
    location.pathname.match(new RegExp(`^/${space}/[^/]+$`))
  );

  const isUserProfileRoute = location.pathname.match(/^\/[^/]+$/);

  return (
    <div className="h-screen flex flex-col w-screen bg-home-divider">
      {/* Top Bar */}
      <div className="flex-shrink-0">
        <TopBar />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel */}
        <div className="hidden mdlg:block w-72 flex-shrink-0 overflow-y-auto">
          <LeftPanel setFilteredSpace={setFilteredSpace} />
        </div>

        {/* Middle Panel */}
        <div className="flex-1 flex justify-center items-start overflow-y-auto middle-part">
          <div className="w-[700px] max-w-full">
            {/* Conditionally render panels based on the route */}
            {isUserProfileRoute ? (
              <UserProfile />
            ) : isReplyRoute ? (
              <ReplyPanel />
            ) : (
              <MidPanel filteredSpace={filteredSpace} setFilteredSpace={setFilteredSpace} />
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className="hidden xl:block w-72 flex-shrink-0 overflow-y-auto">
          <RightPanel />
        </div>
      </div>
    </div>
  );
};

export default LoggedInHome;
