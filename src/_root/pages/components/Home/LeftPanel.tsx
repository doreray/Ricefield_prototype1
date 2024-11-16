import React from 'react'

function LeftPanel() {
    return (
        <div className="w-64 bg-gray-100 p-4">
          <ul>
            <li className="mb-4 font-bold">Home</li>
            <li className="mb-2 text-gray-600">News</li>
            <li className="mb-2 text-gray-600">Questions</li>
            <li className="mb-2 text-gray-600">Rant</li>
            <li className="mb-2 text-gray-600">Confession</li>
            <li className="mb-2 text-gray-600">Memes</li>
          </ul>
        </div>
      );
    };
    
    export default LeftPanel;