import React from 'react'

function TopBar() {
    return (
        <div className="h-16 bg-white text-white flex justify-between items-center px-4">
          <img src="/assets/icons/Ricefield_logo.svg" alt="Logo" className="h-8" />
          <button className="bg-blue-500 px-4 py-2 rounded text-sm hover:bg-blue-600">
            Log In
          </button>
        </div>
      );
    };
    
    export default TopBar;
