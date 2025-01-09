export interface PollOption {
    option: string;
    votes: number;
    percentage?: number;
  }
  
  export interface Poll {
    id: string;
    question: string;
    options: PollOption[];
  }
  