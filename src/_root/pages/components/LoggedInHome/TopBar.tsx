// TopBar.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { useUser } from '@/contexts/UserContext';

const TopBar: React.FC = () => {
  const { user } = useUser(); // Access user from context

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClosing, setIsClosing] = useState(false); // State for fade-out animation
  const [isProfileOpen, setIsProfileOpen] = useState(false); // New state for profile menu
  const menuRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null); // Ref for profile dropdown
  const navigate = useNavigate();
  const auth = getAuth();

  const toggleMenu = () => {
    if (isMenuOpen) {
      setIsClosing(true);
      setTimeout(() => {
        setIsMenuOpen(false);
        setIsClosing(false);
      }, 300);
    } else {
      setIsMenuOpen(true);
      setIsClosing(false);
    }
  };

  const toggleProfileMenu = () => {
    setIsProfileOpen(!isProfileOpen); // Toggle profile dropdown
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      menuRef.current && !menuRef.current.contains(event.target as Node) &&
      profileRef.current && !profileRef.current.contains(event.target as Node)
    ) {
      setIsMenuOpen(false);
      setIsProfileOpen(false); // Close profile menu if clicked outside
    }
  };

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        navigate('/');
      })
      .catch((error) => {
        console.error('Error logging out:', error);
      });
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div className="h-16 bg-white text-black flex justify-between items-center px-4 border border-slate-200">
      <div className="flex items-center space-x-1">
        <img
          src="/assets/icons/ricefield logo home.svg"
          alt="Logo"
          className="h-8 cursor-pointer"
          onClick={() => window.location.reload()}
        />
        <img
          src="/assets/icons/beta version mark.svg"
          alt="BETA"
          className="h-5 mb-4 cursor-pointer"
          onClick={() => navigate('/home')}
        />
      </div>
      <div className="flex items-center space-x-4">
        {/* Profile Picture Button with Dropdown */}
        <div ref={profileRef} className="relative">
          <img
            src="/assets/icons/pfp on post.svg" // Your profile picture
            alt="Profile"
            className="h-10 rounded-full cursor-pointer"
            onClick={toggleProfileMenu}
          />

          {isProfileOpen && (
            <div
              className={`absolute right-0 mt-2 w-80 bg-white border border-primary-500 rounded-xl shadow-lg z-10 transition-all duration-300`}
            >
              {/* Profile Info Box with White Overlay */}
              <div className="relative">
                <div className="absolute top-0 left-0 w-full h-full bg-black opacity-70 rounded-t-xl-1"></div>
                <img
                  src="/assets/icons/pfp-banner.svg"
                  alt="Banner"
                  className="w-full h-40 object-cover rounded-t-xl-1"
                />
                <div className="absolute bottom-3 justify-items-center w-full px-4 py-2 text-white z-10">
                  <div className="flex-col">
                    <div className="flex space-x-2">
                      <img
                        src="/assets/icons/pfp on post.svg"
                        alt="Profile"
                        className="h-14 rounded-full cursor-pointer"
                      />
                      <div>
                        <div className="text-lg font-bold leading-none pt-3 flex space-x-1">
                          <p>{user?.first_name}</p> 
                          <p>{user?.last_name}</p>
                        </div>
                        <div className="text-sm text-primary-500 leading-none">@{user?.username}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-12 pt-4">
                    <div className="flex justify-items-center space-x-1">
                      <div className="text-lg font-bold font-dmsans">{user?.followers}</div>
                      <div className="text-sm pt-1">Followers</div>
                    </div>
                    <div className="flex justify-items-center space-x-1">
                      <div className="text-lg font-bold font-dmsans">{user?.following}</div>
                      <div className="text-sm pt-1">Following</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex space-x-4 px-4 py-3 hover:bg-gray-100 cursor-pointer">
                <img
                  src="/assets/icons/setting-icon.svg"
                  className="h-8"
                  alt="edit"
                />
                <div className="font-semibold text-lg">Edit Profile</div>
              </div>
              <div
                className="flex space-x-4 px-4 py-3 hover:bg-gray-100 rounded-b-xl cursor-pointer"
                onClick={handleLogout}
              >
                <img
                  src="/assets/icons/logout - icon.svg"
                  className="h-8"
                  alt="logout"
                />
                <div className="font-semibold text-lg">Log Out</div>
              </div>
            </div>
          )}
        </div>

        {/* More Button with Dropdown */}
        <div ref={menuRef} className="relative">
          <img
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            src={
              isHovered
                ? '/assets/icons/three dot (hover).svg'
                : '/assets/icons/three dot (default).svg'
            }
            alt="More"
            className="h-8 w-8 cursor-pointer"
            onClick={toggleMenu}
          />

          {isMenuOpen && (
            <div
              className={`absolute right-0 mt-2 w-60 bg-white border border-gray-300 rounded-lg shadow-lg z-10 $(
                isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
              ) transition-all duration-300`}
            >
              <ul className="flex flex-col">
                <li
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-3"
                  onClick={() => alert('Connect clicked')}
                >
                  <img src="/assets/icons/handshake-icon.svg" className="h-5" />
                  <div className="font-semibold">Connect with us</div>
                </li>
                <li
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-3"
                  onClick={() => alert('Dict clicked')}
                >
                  <img src="/assets/icons/dictionary-icon.svg" className="h-5" />
                  <div className="font-semibold">Farmers' Dictionary</div>
                </li>
                <li
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-3"
                  onClick={() => alert('Report clicked')}
                >
                  <img src="/assets/icons/report-icon.svg" className="h-5" />
                  <div className="font-semibold">Report an issue</div>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopBar;
