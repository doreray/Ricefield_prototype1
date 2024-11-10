// api.ts
import { auth } from './config'; // Ensure you have the Firebase auth initialized
import { INewUser } from '@/types';
import { createUserWithEmailAndPassword } from 'firebase/auth';

export async function createUserAccount(user: INewUser) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password);
        // User account has been created successfully
        const newUser = userCredential.user;
        
        // Optionally, you can return additional user info or create a Firestore document here
        return newUser;
    } catch (error) {
        console.error("Error creating user:", error);
        return error;
    }
}
