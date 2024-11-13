import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Loader from "../../components/shared/Loader";
import { auth } from "@/lib/firebase/config";
import { applyActionCode } from "firebase/auth";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";

const VerifyEmailForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const oobCode = searchParams.get("oobCode");
  const mode = searchParams.get("mode");

  // Check if mode and oobCode are valid
  useEffect(() => {
    if (mode !== "verifyEmail" || !oobCode) {
      setError("Invalid or expired verification link.");
      return;
    }

    const verifyEmail = async () => {
      try {
        setIsLoading(true);
        await applyActionCode(auth, oobCode); // Apply the email verification code
        setSuccess(true); // Set success message
      } catch (error) {
        console.error("Error verifying email:", error);
        setError("Failed to verify email. Please try again or request a new link.");
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, [oobCode, mode, navigate]);

  return (
    <Form>
      <div className="sm:w-420 flex-center flex-col">
        <img src="/assets/icons/Ricefield_logo.svg" alt="logo" />
        
        <h2 className="h3-bold md:h2-bold pt-5 sm:pt-12"> Verify Your Email </h2>
        <p className="text-light-3 body-regular md:body-regular mt-2">
          Please wait while we verify your email address.
        </p>
        
        {isLoading && (
          <div className="flex-center gap-2 mt-4">
            <Loader /> Loading...
          </div>
        )}
        
        {error && <p className="text-red text-center mt-4">{error}</p>}
        {success && (
          <p className="text-green text-center mt-4">
            Your email has been verified! Please go back to previous page.
          </p>
        )}
      </div>
    </Form>
  );
};

export default VerifyEmailForm;
