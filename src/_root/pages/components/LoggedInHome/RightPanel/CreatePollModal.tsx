import React, { useState, useEffect } from 'react';
import { addDoc, collection, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { getAuth } from 'firebase/auth';

interface CreatePollModalProps {
  isOpen: boolean;
  onClose: () => void;
  setPolls: React.Dispatch<React.SetStateAction<any[]>>;
}

export const CreatePollModal: React.FC<CreatePollModalProps> = ({
  isOpen,
  onClose,
  setPolls,
}) => {
  const [title, setTitle] = useState('');
  const [options, setOptions] = useState(['', '']);
  const auth = getAuth();
  const user = auth.currentUser;

  const handleAddOption = () => {
    if (options.length < 5) {
      setOptions([...options, '']);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleCreatePoll = async () => {
      if (!user) return alert('Please log in to create a poll!');
      if (options.length < 2) return alert('Poll must have at least 2 options!');
    
      const pollData = {
        question: title,
        options: options.map(option => ({option})),
      };
    
      const pollCollectionRef = collection(db, 'polls');
      const pollDoc = await addDoc(pollCollectionRef, pollData);
    
      // Create documents in the 'options' subcollection for each option
      for (let i = 0; i < options.length; i++) {
        const optionRef = doc(pollDoc, 'options', `${i}`);
        await setDoc(optionRef, { votes: 0 });  // Create the document with initial vote count
      }
    
      onClose(); // Close the modal after creation
    };

  return (
    <div className={`modal-overlay ${!isOpen ? 'hidden' : ''}`}>
      <div className="modal-content bg-white rounded-lg border border-slate-200 mr-2 p-6 max-w-lg mx-auto">
        <h3 className="text-2xl font-semibold mb-4 text-center">Create a Poll</h3>
        <input
          type="text"
          placeholder="Poll Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full mb-4 p-2 border border-gray-300 rounded-md"
        />
        {options.map((option, index) => (
          <input
            key={index}
            type="text"
            placeholder={`Option ${index + 1}`}
            value={option}
            onChange={(e) => handleOptionChange(index, e.target.value)}
            className="w-full mb-2 p-2 border border-gray-300 rounded-md"
          />
        ))}
        {options.length < 5 && (
          <button
            onClick={handleAddOption}
            className="w-full mb-4 py-2 bg-gray-200 text-black rounded-full hover:bg-gray-300 flex justify-center items-center"
          >
            Add Option
          </button>
        )}
        <div className="flex justify-between items-center gap-4">
          <button
            onClick={handleCreatePoll}
            className="w-1/2 py-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 flex justify-center items-center"
          >
            Create Poll
          </button>
          <button
            onClick={onClose}
            className="w-1/2 py-2 bg-gray-200 text-black rounded-full hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
