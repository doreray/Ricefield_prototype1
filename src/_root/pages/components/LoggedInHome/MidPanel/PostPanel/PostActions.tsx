import React, { useState, useEffect, useRef } from 'react';
import { getFirestore, doc, collection, deleteDoc } from 'firebase/firestore';
import DeleteConfirmationPopup from '../DeleteConfirmationPopup';

interface User {
    first_name: string;
    last_name: string;
    username: string;
    uid: string;
    school: string;
}

interface Post {
    id: string;
    owner: string;
    content: string;
    timestamp: { seconds: number } | null;
    space: string; // Space identifier for Firestore
    title: string;
    user: User;
    image?: string;
}

interface PostActionsProps {
    post: Post;
    currentUser: User;
    setPopupVisible: React.Dispatch<React.SetStateAction<boolean>>;
    isPopupVisible: boolean;
    setPostDeleted: (deleted: boolean) => void; // Add this prop
}

const PostActions: React.FC<PostActionsProps> = ({
    post,
    currentUser,
    setPopupVisible,
    isPopupVisible,
    setPostDeleted, // Receive the prop
}) => {
    const [hoveredPostId, setHoveredPostId] = useState<string | null>(null);
    const [isDropdownVisible, setDropdownVisible] = useState(false);
    const [toastVisible, setToastVisible] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [fadeToast, setFadeToast] = useState(false); // Controls fade-out
    const dropdownRef = useRef<HTMLDivElement>(null);
    const db = getFirestore();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownVisible(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    const showToast = (message: string) => {
        setToastMessage(message);
        setToastVisible(true);
        setFadeToast(false);

        setTimeout(() => setFadeToast(true), 2000); // Start fade-out after 2 seconds
        setTimeout(() => setToastVisible(false), 3000); // Fully hide toast after 3 seconds
    };

    const handleDeletePost = async () => {
        setDropdownVisible(false);
        try {
            // Reference to the Firestore post document
            const postRef = doc(collection(db, 'spaces', post.space, 'posts'), post.id);
            await deleteDoc(postRef); // Delete the post
            setPostDeleted(true); // Notify parent that the post is deleted
            showToast('Post deleted successfully!');
            setPopupVisible(false); // Close the confirmation popup
        } catch (error) {
            console.error('Error deleting post:', error);
            showToast('Failed to delete the post. Please try again.');
        }
    };

    const handleCopyPostLink = () => {
        setDropdownVisible(false);
        const postUrl = `${window.location.origin}/${post.space}/${post.id}`;
        navigator.clipboard.writeText(postUrl).then(() => {
            showToast('Post URL copied to clipboard!');
        });
    };

    const handleReportPost = () => {
        // Open the report form in a new tab
        setDropdownVisible(false);
        window.open('https://docs.google.com/forms/d/e/1FAIpQLScZUJQN2_wO0a-vdJVSDGLsVWOi1dLkicMkpJpaqtE1yfLOpg/viewform', '_blank');
    };

    return (
        <div className="relative">
            <div className="flex items-center space-x-2" ref={dropdownRef}>
                <div>
                    <img
                        onMouseEnter={() => setHoveredPostId(post.id)}
                        onMouseLeave={() => setHoveredPostId(null)}
                        src={
                            hoveredPostId === post.id
                                ? '/assets/icons/three dot (hover).svg'
                                : '/assets/icons/three dot (default).svg'
                        }
                        alt="More"
                        className="h-8 w-8 cursor-pointer"
                        onClick={() => setDropdownVisible((prev) => !prev)} // Show the dropdown on click
                    />
                    {isDropdownVisible && (
                        <div className="absolute right-0 bg-white shadow-md border border-gray-200 rounded-lg w-40">
                            <div
                                onClick={handleCopyPostLink}
                                className="px-4 py-2 font-bold cursor-pointer flex items-center space-x-2"
                            >
                                <img src="/assets/icons/copy_link_icon.svg" className="h-6" />
                                <div>Copy link</div>
                            </div>
                            {post.owner === currentUser.uid && (
                                <div
                                    onClick={() => setPopupVisible(true)}
                                    className="px-4 py-2 text-rose-600 font-bold cursor-pointer flex items-center space-x-2"
                                >
                                    <img
                                        src="/assets/icons/trash_icon.svg"
                                        className="h-6 ml-0.5"
                                    />
                                    <div>Delete post</div>
                                </div>
                            )}
                            {post.owner !== currentUser.uid && (
                                <div
                                    onClick={handleReportPost} // Trigger report onClick
                                    className="px-4 py-2 text-yellow-500 font-bold cursor-pointer flex items-center space-x-2"
                                >
                                    <img src="/assets/icons/report_icon.svg" className="h-7" />
                                    <div>Report</div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            {isPopupVisible && (
                <DeleteConfirmationPopup
                    onCancel={() => setPopupVisible(false)}
                    onDelete={handleDeletePost}
                />
            )}
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
    );
};

export default PostActions;
