import React, { useState } from 'react';

type PollOption = {
  option: string;
  votes: number;
};


function RightPanel() {
  const [pollOptions, setPollOptions] = useState<PollOption[]>([
    { option: 'Option 1', votes: 0 },
    { option: 'Option 2', votes: 0 },
    { option: 'Option 3', votes: 0 },
    { option: 'Option 4', votes: 0 },
  ]);
  const [userVote, setUserVote] = useState<number | null>(null); // Tracks user's selected option

  const handleVote = (clickedIndex: number): void => {
    // If the user clicks the currently selected option, deselect it
    if (userVote === clickedIndex) {
      const updatedPollOptions = pollOptions.map((opt, i) =>
        i === clickedIndex ? { ...opt, votes: opt.votes - 1 } : opt
      );
      setPollOptions(updatedPollOptions);
      setUserVote(null); // Clear the user's vote
      return;
    }

    // Update votes for switching selection or first selection
    const updatedPollOptions = pollOptions.map((opt, i) => {
      if (i === userVote) return { ...opt, votes: opt.votes - 1 }; // Decrement previous vote
      if (i === clickedIndex) return { ...opt, votes: opt.votes + 1 }; // Increment new vote
      return opt; // Leave other options unchanged
    });

    setPollOptions(updatedPollOptions);
    setUserVote(clickedIndex); // Update user's selected option
  };

  const totalVotes = pollOptions.reduce((sum, opt) => sum + opt.votes, 0);

  return (
    <div className="w-72 bg-home-divider pt-6 flex flex-col items-center space-y-4 pr-2">
      <div className="w-68 border border-slate-200 rounded-lg bg-white pt-1 pl-5 pr-5 pb-3">
        {/* Question */}
        <div className="flex space-x-1 mb-4">
          <p className="text-sm">Question from</p>
          <p className="font-bold text-sm">Ricefield</p>
        </div>
        <p className="text-base font-medium mb-4">What's your favorite feature?</p>

        {/* Poll Options */}
        {pollOptions.map((option, index) => {
          const percentage = totalVotes
            ? ((option.votes / totalVotes) * 100).toFixed(1)
            : 0;

          return (
            <button
              key={index}
              onClick={() => handleVote(index)}
              className="w-full mb-2 text-left rounded-full overflow-hidden border border-gray-300"
              style={{
                background: `linear-gradient(to right, #448D56 ${percentage}%, #ffffff ${percentage}%)`,
              }}
            >
              <div className="flex justify-between px-4 py-2">
                <span
                  className={`text-sm ${
                    userVote === index ? 'font-bold text-white' : 'text-black'
                  }`}
                >
                  {option.option}
                </span>
                <span 
                className={`text-sm ${
                  userVote === index ? ' text-white' : 'text-black'
                  }`}>
                  {percentage}%
                </span>
              </div>
            </button>
          );
        })}

        {/* Total Votes */}
        <div className="mt-4 text-sm text-gray-600">
          Total Votes: <span className="font-medium">{totalVotes}</span>
        </div>
      </div>
    </div>
  );
}

export default RightPanel;
