import './globals.css';
import { Routes, Route, useSearchParams } from 'react-router-dom';
import SigninForm from './_auth/forms/SigninForm';
import SignupForm from './_auth/forms/SignupForm';
import AuthLayout from './_auth/AuthLayout';
import Home from './_root/Home';
import VerifyEmail from './_auth/forms/VerifyEmail';
import SignupForm2 from './_auth/forms/SignupForm2';
import EmailResetPassword from './_auth/forms/EmailResetPassword';
import PreResetPassword from './_auth/forms/PreResetPassword';
import ResetPasswordForm from './_auth/forms/ResetPassword';
import EmailConfirmation from './_auth/forms/EmailConfirmation';

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

const App = () => {
  return (
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
        <Route element={<Home />}>
          <Route path="/" element={<Home />} />
        </Route>
      </Routes>
    </main>
  );
};

export default App;
