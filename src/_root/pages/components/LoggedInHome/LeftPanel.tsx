import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface LeftPanelProps {
  setFilteredSpace: React.Dispatch<React.SetStateAction<string>>; // Prop to update filteredSpace
}

const LeftPanel: React.FC<LeftPanelProps> = ({ setFilteredSpace }) => {
  const [isSpacesMenuOpen, setIsSpacesMenuOpen] = useState(true);

  const navigate = useNavigate();

  const toggleSpacesMenu = () => {
    setIsSpacesMenuOpen((prev) => !prev);
  };

  const handleHomeClick = () => {
    setFilteredSpace(''); // Reset the filter to show all posts when "Home" is clicked
    navigate('/');
    window.location.reload();
  };

  return (
    <div className="w-72 bg-home-divider pt-7 flex flex-col items-center space-y-4 pl-2">
      {/* Home Button */}
      <div>
        <Button
          className="shad-button_spaces w-68 h-11 flex space-x-2 p-5 border border-slate-200"
          onClick={handleHomeClick} // Reset filter when home is clicked
        >
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
            className={`h-5 transition-transform duration-300 ${isSpacesMenuOpen ? 'rotate-180' : ''}`}
          />
        </div>

        {/* Dropdown Menu */}
        <ul
          className={`flex flex-col bg-white overflow-hidden transition-all duration-500 ${isSpacesMenuOpen ? 'max-h-96 opacity-100 rounded-lg' : 'max-h-0 opacity-0'}`}
        >
          {['Confession', 'Memes', 'News', 'Questions', 'Rant'].map((space) => (
            <li
              key={space}
              className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-100 cursor-pointer text-black"
              onClick={() => setFilteredSpace(space.toLowerCase())}
            >
              <img
                src={`/assets/icons/space-${space}-icon.svg`}
                alt={space}
                className="h-6 w-6"
              />
              <div className="font-medium text-sm">{space}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default LeftPanel;
