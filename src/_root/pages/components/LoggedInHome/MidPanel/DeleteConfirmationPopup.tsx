import React from 'react';
import { Button } from '@/components/ui/button';

interface DeleteConfirmationPopupProps {
  onCancel: () => void;  // Function to close the popup
  onDelete: () => void; // Function to confirm the delete action
}

const DeleteConfirmationPopup: React.FC<DeleteConfirmationPopupProps> = ({ onCancel, onDelete }) => {
  const handleBackgroundClick = (e: React.MouseEvent) => {
    // Prevents closing the popup if the user clicks inside the white box
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div 
      className="fixed top-0 -left-2 w-full h-full bg-opacity-50 bg-gray-800 flex justify-center items-center" 
      onClick={handleBackgroundClick} // Close the popup when clicking outside
    >
      <div className="bg-white p-8 rounded-lg" onClick={(e) => e.stopPropagation()}>
        <div className='text-center w-full font-bold text-lg'>Delete Post?</div>
        <div className=''>
          Uh-oh, looks like it's cooked a bit too much<br/>and now it's burned!
          This action is permanent<br/>and can't be undone.
          Your post will be gone<br/>from your profile, your followers' feeds,<br/>and search results.
          <div className='font-bold mt-4'>No take-backs!</div>
        </div>
        <div className="flex flex-col items-center space-y-6 mt-5">
          <Button onClick={onDelete} className="bg-rose-600 text-white hover:bg-rose-700 w-full">Delete</Button>
          <Button onClick={onCancel} className="bg-gray-200 hover:bg-gray-300 text-black w-full">Cancel</Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationPopup;
