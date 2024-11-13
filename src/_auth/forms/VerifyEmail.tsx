import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "@/lib/firebase/config";
import { Button } from "@/components/ui/button";

const VerifyEmail = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const navigate = useNavigate();

  return (
    <div className="sm:w-420 flex-center flex-col">
      <img src="public/assets/icons/Ricefield_logo.svg" alt="logo" />
      <h2 className="h3-bold md:h2-bold pt-5 sm:pt-12">Check your inbox!</h2>
      <p className="text-dark-1 body-regular md:body-regular mt-4">
        We have just sent you an email with a verification link.
      </p>
      <p className="text-dark-1 body-regular md:body-regular mt-4">
        Please check your inbox to continue the process.
      </p>
      
      {warningMessage && (
        <p className="text-red mt-4">{warningMessage}</p>
      )}
    </div>
  );
};

export default VerifyEmail;
