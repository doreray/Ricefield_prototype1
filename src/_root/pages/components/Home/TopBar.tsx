import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

function TopBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [menuStyle, setMenuStyle] = useState({});
  const [isClosing, setIsClosing] = useState(false); // State for fade-out animation
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const toggleMenu = () => {
    if (isMenuOpen) {
      // Trigger fade-out animation before closing
      setIsClosing(true);
      setTimeout(() => {
        setIsMenuOpen(false);
        setIsClosing(false); // Reset after unmounting
      }, 300); // Match the transition duration
    } else {
      // Trigger fade-in animation
      setMenuStyle({
        opacity: 0,
        transform: 'scale(0.95)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
      });
      setIsMenuOpen(true);
      setTimeout(() => {
        setMenuStyle({
          opacity: 1,
          transform: 'scale(1)',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
        });
      }, 0);
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      toggleMenu(); // Close the menu when clicking outside
    }
  };

  useEffect(() => {
    if (isMenuOpen) {
      document.addEventListener('click', handleClickOutside);
    } else {
      document.removeEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <div className="h-16 bg-white text-black flex justify-between items-center px-4 border border-slate-200">
      <div className="flex items-center space-x-1">
      <img src="/assets/icons/ricefield logo home.svg" alt="Logo" className="h-7" />
      <img src="/assets/icons/beta version mark.svg" alt="BETA" className='h-5 mb-3'/>
      </div>
      <div className="flex items-center space-x-4">
        {/* Log In Button */}
        <Button className="shad-button_primary rounded-full h-10 w-40" onClick={() => navigate('/sign-up')}>
          Log In
        </Button>
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

          {(isMenuOpen || isClosing) && (
            <div
              className="absolute right-0 mt-2 w-60 bg-white border border-gray-300 rounded-lg shadow-lg z-10"
              style={{
                ...menuStyle,
                ...(isClosing && {
                  opacity: 0,
                  transform: 'scale(0.95)',
                  transition: 'opacity 0.3s ease, transform 0.3s ease',
                }),
              }}
            >
              <ul className="flex flex-col">
                <li
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-3"
                  onClick={() => alert('Connect clicked')}
                >
                  <img src='/assets/icons/handshake-icon.svg' className='h-5'/>
                  <div className='font-semibold'>
                  Connect with us
                  </div>
                </li>
                <li
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-3"
                  onClick={() => alert('Dict clicked')}
                >
                  <img src='/assets/icons/dictionary-icon.svg' className='h-5'/>
                  <div className='font-semibold'>
                  Farmers' Dictionary
                  </div>
                </li>
                <li
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-3"
                  onClick={() => alert('Report clicked')}
                >
                  <img src='/assets/icons/report-icon.svg' className='h-5'/>
                  <div className='font-semibold'>
                  Report an issue
                  </div>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TopBar;
