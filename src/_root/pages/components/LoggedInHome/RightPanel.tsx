import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, onSnapshot, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, increment } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

type PollOption = {
  option: string;
  votes: number;
  percentage?: number;
};

type Poll = {
  id: string;
  question: string;
  options: PollOption[];
};

function RightPanel() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [userVote, setUserVote] = useState<{ [key: string]: number | null }>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [isConfirmDelete, setIsConfirmDelete] = useState<string | null>(null);
  const auth = getAuth();
  const user = auth.currentUser;

  const allowedUser = 'eBql2EJ7WdZsbH4rCJzhEf5TZm83';
  const allowedEmail = 'phamhoa2@msu.edu';

  // Check if the current user is allowed
  const isUserAllowed = user?.uid === allowedUser && user?.email === allowedEmail;

  // Fetch polls from Firebase
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'polls'), (snapshot) => {
      const fetchedPolls = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          question: data.question,
          options: data.options,
        } as Poll;
      });
      setPolls(fetchedPolls);
    });

    return () => unsubscribe();
  }, []);

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
      options: options.map(option => ({ option, votes: 0 })),  // Add initial votes: 0
    };
  
    const pollCollectionRef = collection(db, 'polls');
    const pollDoc = await addDoc(pollCollectionRef, pollData);
  
    // Create documents in the 'options' subcollection for each option
    for (let i = 0; i < options.length; i++) {
      const optionRef = doc(pollDoc, 'options', `${i}`);
      await setDoc(optionRef, { votes: 0 });  // Create the document with initial vote count
      const votedCollectionRef = collection(pollDoc, `voted${i}`);
      await addDoc(votedCollectionRef, {}); // Placeholder to create sub-collection
    }
  
    setIsModalOpen(false); // Close the modal after creation
  };

  const handleVote = async (pollId: string, optionIndex: number) => {
    if (!user) return alert('Please log in to vote!');
  
    const pollRef = doc(db, 'polls', pollId);
  
    // Check if the user has voted on a different option
    const previousVoteIndex = userVote[pollId];
  
    if (previousVoteIndex !== undefined && previousVoteIndex !== optionIndex) {
      // Remove user's previous vote
      const previousVotedCollectionRef = collection(pollRef, `voted${previousVoteIndex}`);
      const previousUserVoteRef = doc(previousVotedCollectionRef, user.uid);
      await deleteDoc(previousUserVoteRef);
  
      const previousOptionRef = doc(pollRef, 'options', `${previousVoteIndex}`);
      await updateDoc(previousOptionRef, { votes: increment(-1) });
    }
  
    const votedCollectionRef = collection(pollRef, `voted${optionIndex}`);
    const userVoteRef = doc(votedCollectionRef, user.uid);
    const userVoteDoc = await getDoc(userVoteRef);
  
    if (!userVoteDoc.exists()) {
      // Create the voted collection and document only if the user is voting for the first time
      await addDoc(votedCollectionRef, {});  // Create the sub-collection dynamically
  
      // Add user to the voted collection and increment the vote count
      await setDoc(userVoteRef, { userId: user.uid });
      const optionRef = doc(pollRef, 'options', `${optionIndex}`);
      await updateDoc(optionRef, { votes: increment(1) });
    } else {
      // If the user has already voted, remove their vote
      await deleteDoc(userVoteRef);
      const optionRef = doc(pollRef, 'options', `${optionIndex}`);
      await updateDoc(optionRef, { votes: increment(-1) });
    }
  
    // Update the userVote state to reflect the new vote
    setUserVote((prevVotes) => ({ ...prevVotes, [pollId]: optionIndex }));
  
    // Recalculate the total votes and percentages
    await getPollsWithVoteCounts();
  };  

  const getPollsWithVoteCounts = async () => {
    const updatedPolls = await Promise.all(polls.map(async (poll) => {
      const pollRef = doc(db, 'polls', poll.id);
      
      let totalVotes = 0;
      
      // Retrieve votes directly from options
      const totalVotesArray = await Promise.all(poll.options.map(async (_, index) => {
        const optionRef = doc(pollRef, 'options', `${index}`);
        const optionDoc = await getDoc(optionRef);
        return optionDoc.data()?.votes || 0;
      }));
      
      totalVotes = totalVotesArray.reduce((sum, votes) => sum + votes, 0);
      
      const optionsWithPercentages = poll.options.map((option, index) => ({
        ...option,
        votes: totalVotesArray[index],
        percentage: totalVotes > 0 ? (totalVotesArray[index] / totalVotes) * 100 : 0,
      }));
      
      return { ...poll, options: optionsWithPercentages };
    }));
    
    setPolls(updatedPolls);
  };

  const handleDeletePoll = async (pollId: string) => {
    if (isUserAllowed) {
      await deleteDoc(doc(db, 'polls', pollId));
    }
  };

  return (
    <div className="w-72 bg-home-divider pt-7 flex flex-col items-center space-y-4 pl-2">
      {isUserAllowed && (
        <button
          onClick={() => setIsModalOpen((prev) => !prev)}
          className="w-full py-2 mr-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
        >
          Create Poll
        </button>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
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
              onClick={() => setIsModalOpen(false)}
              className="w-1/2 py-2 bg-gray-200 text-black rounded-full hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
      
      )}

      {polls.map((poll) => (
        <div key={poll.id} className="w-72 bg-home-divider flex flex-col items-center space-y-4 pr-2">
          <div className="w-68 border border-slate-200 rounded-lg bg-white pt-1 pl-5 pr-5 pb-3">
            <div className='flex justify-between items-center'>
            {/* Question */}
            <div className="flex space-x-1 mb-4 mt-2">
              <p className="text-sm">Question from</p>
              <p className="font-bold text-sm">Ricefield</p>
            </div>
            <div>
              {/* Delete Button */}
              {isUserAllowed && (
                <button
                  onClick={() => setIsConfirmDelete(poll.id)}
                  className="text-2xl"
                >
                  x
                </button>
              )}

               {/* Confirmation Dialog */}
              {isConfirmDelete === poll.id && (
                <div className="absolute top-0 left-0 w-full h-full bg-gray-500 bg-opacity-50 flex justify-center items-center">
                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <p>Are you sure you want to delete this poll?</p>
                    <div className="flex justify-around mt-4">
                      <button
                        onClick={() => handleDeletePoll(poll.id)}
                        className="bg-rose-500 text-white py-1 px-4 rounded"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setIsConfirmDelete(null)}
                        className="bg-gray-300 py-1 px-4 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            </div>
            
            <p className="text-base font-medium mb-4">{poll.question}</p>

            {/* Poll Options */}
            {poll.options.map((option, index) => {
              const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
              const percentage = totalVotes ? ((option.votes / totalVotes) * 100).toFixed(1) : 0;

              return (
                <button
                  key={index}
                  onClick={() => handleVote(poll.id, index)}
                  className="w-full mb-2 text-left rounded-full overflow-hidden border border-gray-300"
                  style={{
                    background: `linear-gradient(to right, #448D56 ${percentage}%, #ffffff ${percentage}%)`,
                  }}
                >
                  <div className="flex justify-between px-4 py-2">
                    <span
                      className='text-sm text-black'
                    >
                      {option.option}
                    </span>
                    <span className='text-sm text-black'>
                      {percentage}%
                    </span>
                  </div>
                </button>
              );
            })}

            {/* Total Votes */}
            <div className="mt-4 text-sm text-gray-600">
              Total Votes: <span className="font-medium">{poll.options.reduce((sum, opt) => sum + opt.votes, 0)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default RightPanel;
