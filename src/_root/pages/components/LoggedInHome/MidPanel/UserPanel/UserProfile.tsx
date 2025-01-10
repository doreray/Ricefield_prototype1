import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';  // Assuming you have a UserContext to access current user
import UserInfo from './UserInfo';
import UserInfoOther from './UserInfoOther';  // Import the UserInfoOther component

interface User {
  first_name: string;
  last_name: string;
  username: string;
  uid: string;
  school: string;
  schoolId: string;
  about: string;
  major: string;
  gradyear: string;
}

const UserProfile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useUser();  // Get the current logged-in user from context
  const [user, setUser] = useState<User | null>(null);
  const [userUnavailable, setUserUnavailable] = useState(false);
  const [postsCount, setPostsCount] = useState<number>(0);  // State for the number of posts

  useEffect(() => {
    if (!username) return;

    const fetchUser = async () => {
      try {
        const schoolsRef = collection(db, 'schools');
        const schoolsSnapshot = await getDocs(schoolsRef);
        let foundUser: User | null = null;

        for (const schoolDoc of schoolsSnapshot.docs) {
          const schoolId = schoolDoc.id;
          const usersRef = collection(db, 'schools', schoolId, 'users');
          const userQuery = query(usersRef, where('username', '==', username));
          const userQuerySnapshot = await getDocs(userQuery);

          if (!userQuerySnapshot.empty) {
            const userDoc = userQuerySnapshot.docs[0];
            const userData = userDoc.data();

            foundUser = {
              first_name: userData.first_name,
              last_name: userData.last_name,
              username: userData.username,
              uid: userDoc.id,
              school: userData.school,
              schoolId,
              about: userData.about,
              major: userData.major,
              gradyear: userData.grad_year,
            };

            // Fetch the number of posts made by the user across different spaces
            const spaces = ['confession', 'memes', 'news', 'questions', 'rant'];
            let totalPosts = 0;

            for (const space of spaces) {
              const postsRef = collection(db, 'spaces', space, 'posts');
              const postsQuery = query(postsRef, where('owner', '==', userDoc.id));
              const postsSnapshot = await getDocs(postsQuery);
              totalPosts += postsSnapshot.size;
            }

            setPostsCount(totalPosts);  // Set the total posts count

            break;
          }
        }

        if (foundUser) {
          setUser(foundUser);
          setUserUnavailable(false);
        } else {
          setUserUnavailable(true);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setUserUnavailable(true);
      }
    };

    fetchUser();
  }, [username]);

  if (userUnavailable) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-center text-lg font-bold">User not found</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-center text-lg font-bold">Loading...</div>
      </div>
    );
  }

  // Conditional rendering based on whether the profile belongs to the current user
  return (
    <div className='mt-7'>
      {currentUser?.uid === user.uid ? (
        <UserInfo user={user} postsCount={postsCount} />
      ) : (
        <UserInfoOther user={user} postsCount={postsCount} />
      )}
    </div>
  );
};

export default UserProfile;
