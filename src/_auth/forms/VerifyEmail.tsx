import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "@/lib/firebase/config";
import { Button } from "@/components/ui/button";

const VerifyEmail = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const navigate = useNavigate();

  const checkEmailVerification = async () => {
    const user = auth.currentUser;
    if (user) {
      await user.reload();
      if (user.emailVerified) {
        navigate("/sign-up-more");
      }
    }
  };

  useEffect(() => {
    setIsChecking(true);
    // Set interval to check for verification every 2 seconds
    const intervalId = setInterval(() => {
      checkEmailVerification();
    }, 2000);

    // Clear interval when component unmounts
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="sm:w-420 flex-center flex-col">
      <img src="/assets/icons/Ricefield_logo.svg" alt="logo" />
      <h2 className="h3-bold md:h2-bold pt-5 sm:pt-12">Check your inbox!</h2>
      <p className="text-dark-1 body-regular md:body-regular mt-4">
        We have just sent you an email with a verification link.
      </p>
      <p className="text-dark-1 body-regular md:body-regular mt-4">
        Please check your inbox to continue the process.
      </p>
    </div>
  );
};

export default VerifyEmail;
