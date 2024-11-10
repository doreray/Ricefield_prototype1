import './globals.css';
import { Routes, Route } from 'react-router-dom';
import SigninForm from './_auth/forms/SigninForm';
import {Home} from './_root/pages';
import SignupForm from './_auth/forms/SignupForm';
import AuthLayout from './_auth/AuthLayout';
import RootLayout from './_root/RootLayout';
import VerifyEmail from './_auth/forms/VerifyEmail';
import path from 'path';
import SignupForm2 from './_auth/forms/SignupForm2';

const App = () => {
  return (
    <main className='flex h-screen'>
      <Routes>
        {/* public route */}
        <Route element={<AuthLayout />}>
          <Route path="/sign-in" element={<SigninForm />}/>
          <Route path="/sign-up" element={<SignupForm />}/>
          <Route path="/sign-up-more" element={<SignupForm2/>}/>
          <Route path="/verify-email" element={<VerifyEmail/>}/>
        </Route>
        
        {/* private route */}
        <Route element={<RootLayout />}>
          <Route path='/home' element={<Home />}/>
        </Route>
      </Routes>
    </main>
  )
}

export default App

