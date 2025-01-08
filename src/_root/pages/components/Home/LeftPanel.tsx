import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

function LeftPanel() {
  const [isSpacesMenuOpen, setIsSpacesMenuOpen] = useState(true);

  const toggleSpacesMenu = () => {
    setIsSpacesMenuOpen((prev) => !prev);
  };

  return (
    <div className="w-72 bg-home-divider pt-6 flex flex-col items-center space-y-4 pl-2">
      {/* Home Button */}
      <div>
        <Button className="shad-button_spaces w-68 h-11 flex space-x-2 p-5 border border-slate-200">
          <img src="/assets/icons/home-icon.svg" className="h-7" alt="Home" />
          <div className="font-bold text-base">Home</div>
        </Button>
      </div>

      {/* SPACES Section */}
      <div className="w-68 border border-slate-200 rounded-lg bg-white">
        {/* Button Header */}
        <div
          className="flex items-center justify-between px-5 py-2 cursor-pointer h-11 rounded-lg"
          onClick={toggleSpacesMenu}
        >
          <div className="font-bold text-base">Spaces</div>
          <img
            src="/assets/icons/arrow down-icon.svg"
            alt="Toggle"
            className={`h-5 transition-transform duration-300 ${
              isSpacesMenuOpen ? 'rotate-180' : ''
            }`}
          />
        </div>

        {/* Dropdown Menu */}
        <ul
          className={`flex flex-col bg-white overflow-hidden transition-all duration-500 ${
            isSpacesMenuOpen ? 'max-h-96 opacity-100 rounded-lg' : 'max-h-0 opacity-0'
          }`}
        >
          {['Confession', 'Memes', 'News', 'Questions', 'Rant'].map((space, index) => (
            <li
              key={space}
              className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-100 cursor-pointer text-black"
              style={{
                visibility: isSpacesMenuOpen ? 'visible' : 'hidden', // Ensures visibility
                animation: isSpacesMenuOpen
                  ? `fadeIn 0.3s ease ${index * 0.2}s forwards`
                  : 'none',
              }}
              onClick={() => alert(`${space} clicked`)}
            >
              {/* Space Icon */}
              <img
                src={`/assets/icons/space-${space}-icon.svg`}
                alt={space}
                className="h-6 w-6"
              />
              {/* Space Name */}
              <div className="font-medium text-sm">{space}</div>
          </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default LeftPanel;
