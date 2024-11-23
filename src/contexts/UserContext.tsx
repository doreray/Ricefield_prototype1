import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

interface User {
  uid: string;
  first_name: string;
  last_name: string;
  username: string;
  followers: number;
  following: number;
}

interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const auth = getAuth();
  const db = getFirestore();
  const navigate = useNavigate(); // Get navigate function

  // Reload user when navigating to '/home'
  useEffect(() => {
    const handleNavigation = () => {
      setUser(null); // Reset user state on route change
      fetchUserData(); // Re-fetch user data
    };

    // Listen for navigation to '/home' and trigger the refresh
    if (window.location.pathname === '/home') {
      handleNavigation();
    }

    // Cleanup listener
    return () => {
      // Additional cleanup logic if needed
    };
  }, [navigate]);

  const fetchUserData = async () => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser: FirebaseUser | null) => {
      if (currentUser) {
        try {
          // Query all schools to find the user by UID
          const schoolsRef = collection(db, 'schools');
          const schoolsQuery = query(schoolsRef);
          const querySnapshot = await getDocs(schoolsQuery);

          let userFound = false;

          querySnapshot.forEach(async (schoolDoc) => {
            if (userFound) return; // Stop if user is already found
            const usersRef = collection(schoolDoc.ref, 'users');
            const userQuery = query(usersRef, where('uid', '==', currentUser.uid));
            const userSnapshot = await getDocs(userQuery);

            if (!userSnapshot.empty) {
              // User found in this school
              const userDoc = userSnapshot.docs[0];
              const userData = userDoc.data();

              setUser({
                uid: userData?.uid || 'Unknown',
                first_name: userData?.first_name || 'Unknown',
                last_name: userData?.last_name || 'Unknown',
                username: userData?.username || 'unknown_username',
                followers: userData?.followers || 0,
                following: userData?.following || 0,
              });

              userFound = true; // Mark user as found
            }
          });

          if (!userFound) {
            console.error('User not found in any school');
            setUser(null); // Optionally clear user data if no user is found
          }
        } catch (error) {
          console.error('Error retrieving user data:', error);
          setUser(null); // Optionally clear user data on error
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  };

  useEffect(() => {
    fetchUserData(); // Fetch user data on initial load
  }, [auth, db]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
