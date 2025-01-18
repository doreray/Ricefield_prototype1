import React from 'react'
import { useEffect, useState } from 'react';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

interface User {
    first_name: string;
    last_name: string;
    username: string;
    uid: string;
    school: string;
    schoolId: string;
    about: string;
}

interface UserInfoOtherProps {
    user: User;
    postsCount: number;
}

const UserInfoOther: React.FC<UserInfoOtherProps> = ({
    user,
    postsCount,
}) => {
    const [followersCount, setFollowersCount] = useState<number>(0);
    const [followingsCount, setFollowingsCount] = useState<number>(0);
    useEffect(() => {
        if (!user?.uid || !user?.schoolId) return;

        const fetchFollowStats = async () => {
            try {
                // Fetch followers
                const followersQuery = query(
                    collection(db, 'schools', user.schoolId, 'users', user.uid, 'followers')
                );
                const followersSnapshot = await getDocs(followersQuery);
                setFollowersCount(followersSnapshot.size);

                // Fetch followings
                const followingsQuery = query(
                    collection(db, 'schools', user.schoolId, 'users', user.uid, 'followings')
                );
                const followingsSnapshot = await getDocs(followingsQuery);
                setFollowingsCount(followingsSnapshot.size);
            } catch (error) {
                console.error('Error fetching follow stats:', error);
            }
        };

        fetchFollowStats();
    }, [user?.uid, user?.schoolId]);

    return (
        <div className="relative">
            <img
                src="/assets/icons/pfp on post.svg"
                alt="Profile"
                className="h-24 rounded-full cursor-pointer absolute top-28 left-8 ring-2 ring-white"
            />
            <img
                src="/assets/icons/pfp-banner.svg"
                alt="Banner"
                className="w-full h-40 object-cover rounded-t-xl-1 border-x border-t"
            />
            <div className="bg-white pl-8 pt-14 pb-6 rounded-b-xl border">
                <div className="text-2xl font-bold">{user.first_name} {user.last_name}</div>
                <div className="text-primary-500 text-xl -mt-1">@{user.username}</div>
                <div className='mt-3 text-lg'>{user.about}</div>
                <div className='mt-3 flex space-x-10'>
                    <div className='space-x-1.5'>
                        <span className='font-dmsans font-bold text-lg'>{postsCount}</span>
                        <span className='text-primary-500 text-lg'>Posts cooked</span>
                    </div>
                    <div className='space-x-1.5'>
                        <span className='font-dmsans font-bold text-lg'>{followersCount}</span>
                        <span className='text-primary-500 text-lg'>Followers</span>
                    </div>
                    <div className='space-x-1.5'>
                        <span className='font-dmsans font-bold text-lg'>{followingsCount}</span>
                        <span className='text-primary-500 text-lg'>Following</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UserInfoOther
