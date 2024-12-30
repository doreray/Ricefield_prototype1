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
  const navigate = useNavigate();
  const location = useLocation();
  const auth = getAuth();

  // Check authentication state only when at "/" or "/home"
  useEffect(() => {
    if (location.pathname === "/" || location.pathname === "/home") {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setIsLoggedIn(true);
          if (location.pathname === "/") navigate("/home");
        } else {
          setIsLoggedIn(false);
          if (location.pathname === "/home") navigate("/");
        }
      });

      // Cleanup subscription on unmount
      return () => unsubscribe();
    }
  }, [location.pathname, navigate, auth]);

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
        <Route path="/" element={isLoggedIn ? <LoggedInHome /> : <Home />} />

        <Route path="/home" element={isLoggedIn ? <LoggedInHome /> : <Home />}>
          {/* Nested route for posts */}
          <Route path="/home/spaces/:space/posts/:postId" element={<ReplyPanel />} />
        </Route>
      </Routes>
    </main>
    </UserProvider>
  );
};

export default App;
