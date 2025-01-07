import { useEffect, useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import './globals.css';
import { Routes, Route } from 'react-router-dom';
import SigninForm from './_auth/forms/SigninForm';
import SignupForm from './_auth/forms/SignupForm';
import AuthLayout from './_auth/AuthLayout';
import Home from './_root/Home';
import LoggedInHome from './_root/LoggedInHome';
import VerifyEmail from './_auth/forms/VerifyEmail';
import SignupForm2 from './_auth/forms/SignupForm2';
import EmailResetPassword from './_auth/forms/EmailResetPassword';
import PreResetPassword from './_auth/forms/PreResetPassword';
import ResetPasswordForm from './_auth/forms/ResetPassword';
import EmailConfirmation from './_auth/forms/EmailConfirmation';
import { UserProvider } from './contexts/UserContext';
import ReplyPanel from './_root/pages/components/LoggedInHome/MidPanel/ReplyPanel';

const AuthActionHandler = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode");

  if (mode === "resetPassword") {
    return <ResetPasswordForm />;
  } else if (mode === "verifyEmail") {
    return <EmailConfirmation />;
  } else {
    return <p>Invalid or unsupported action mode.</p>;
  }
};

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true); // Track loading state
  const navigate = useNavigate();
  const location = useLocation();
  const auth = getAuth();

  useEffect(() => {
    // Check authentication state
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user); // Set logged-in state based on user
      setLoading(false); // Auth check completed
    });
  
    return () => unsubscribe();
  }, [auth]);
  

  if (loading) {
    // Show a loader while authentication is being checked
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <UserProvider>
      <main className="flex h-screen">
        <Routes>
          {/* Public routes */}
          <Route element={<AuthLayout />}>
            <Route path="/sign-in" element={<SigninForm />} />
            <Route path="/sign-up" element={<SignupForm />} />
            <Route path="/sign-up-more" element={<SignupForm2 />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/pre-reset-password" element={<PreResetPassword />} />
            <Route path="/__/auth/action" element={<AuthActionHandler />} />
            <Route path="/email-reset-password" element={<EmailResetPassword />} />
          </Route>

          {/* Private routes */}
          <Route path="/" element={isLoggedIn ? <LoggedInHome /> : <Home />}>
            <Route path="/:space/:postId" element={<ReplyPanel />} />
          </Route>
        </Routes>
      </main>
    </UserProvider>
  );
};

export default App;
