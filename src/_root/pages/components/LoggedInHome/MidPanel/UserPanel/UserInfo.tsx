import React from 'react'
import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Button } from '@/components/ui/button';

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

interface UserInfoProps {
    user: User;
    postsCount: number;
}

const UserInfo: React.FC<UserInfoProps> = ({
    user,
    postsCount,
}) => {
    const [followersCount, setFollowersCount] = useState<number>(0);
    const [followingsCount, setFollowingsCount] = useState<number>(0);
    const [toastVisible, setToastVisible] = useState(false);
        const [toastMessage, setToastMessage] = useState('');
        const [fadeToast, setFadeToast] = useState(false); // Controls fade-out

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

    const showToast = (message: string) => {
        setToastMessage(message);
        setToastVisible(true);
        setFadeToast(false);

        setTimeout(() => setFadeToast(true), 2000); // Start fade-out after 2 seconds
        setTimeout(() => setToastVisible(false), 3000); // Fully hide toast after 3 seconds
    };

    const handleCopyProfileLink = () => {
        const profileUrl = `${window.location.origin}/${user.username}`;
        navigator.clipboard.writeText(profileUrl).then(() => {
            showToast('Farmer\'s URL copied to clipboard!');
        });
    };

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
            <div className="bg-white px-8 pt-3 pb-6 rounded-b-xl border">
                <div className='flex justify-end space-x-3'>
                    <Button className='rounded-full bg-white border border-primary-500 text-primary-500 font-bold hover:bg-primary-500 hover:text-white'>
                        Edit profile
                    </Button>
                    <img
                    src='/assets/icons/copy_link_icon.svg'
                    className='hover:cursor-pointer'
                    onClick={handleCopyProfileLink}/>
                </div>
                <div className="text-2xl font-bold ">{user.first_name} {user.last_name}</div>
                <div className="text-primary-500 text-xl -mt-1">@{user.username}</div>
                <div className='mt-3 text-lg'>{user.about}</div>
                <div className='mt-3 flex space-x-10'>
                    <div className='space-x-1.5'>
                        <span className='font-dmsans font-bold text-lg'>{postsCount}</span>
                        <span className='text-primary-500 text-lg'>Posts</span>
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
                <div className='mt-3 flex space-x-10'>
                    <div className='space-x-3 flex items-center'>
                        <img src='/assets/icons/school_icon.svg' className='h-8'/>
                        <span>{user.school}</span>
                    </div>
                    <div className='space-x-3 flex items-center'>
                        <img src='/assets/icons/major_icon.svg' className='h-8'/>
                        <span>{user.major}</span>
                    </div>
                    <div className='space-x-3 flex items-center'>
                        <img src='/assets/icons/gradyear_icon.svg' className='h-8'/>
                        <span>{user.gradyear}</span>
                    </div>
                </div>
            </div>
            {/* Toast Notification */}
            {toastVisible && (
                <div
                    className={`fixed bottom-3 right-3 bg-white border border-primary-500 text-black py-2 px-4 rounded-lg shadow-md transition-opacity duration-500 ${fadeToast ? 'opacity-0' : 'opacity-100'
                        }`}
                >
                    {toastMessage}
                </div>
            )}
        </div>
    )
}

export default UserInfo
