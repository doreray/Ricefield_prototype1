import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import Loader from "../../components/shared/Loader";
import { useState, useEffect } from "react";
import PasswordChecklist from "react-password-checklist";
import { auth } from "@/lib/firebase/config";
import { confirmPasswordReset } from "firebase/auth";
import { useSearchParams, useNavigate } from "react-router-dom";

const ResetPasswordForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const oobCode = searchParams.get("oobCode");
  const mode = searchParams.get("mode"); // Extracting mode parameter

  // Check for valid oobCode or mode for resetPassword
  useEffect(() => {
    if (mode !== "resetPassword") {
      setError("Invalid mode. This link cannot be used for password reset.");
      return;
    }
    if (!oobCode) {
      setError("Invalid or expired reset link.");
    }
  }, [oobCode, mode]);

  const ResetPasswordValidation = z
    .object({
      password: z.string().min(8, "Password must be at least 8 characters"),
      retypePassword: z.string().min(1, "Please retype your password"),
    })
    .superRefine((data, ctx) => {
      if (data.password !== data.retypePassword) {
        ctx.addIssue({
          path: ["retypePassword"],
          message: "Passwords do not match.",
          code: z.ZodIssueCode.custom,
        });
      }
    });

  const form = useForm<z.infer<typeof ResetPasswordValidation>>({
    resolver: zodResolver(ResetPasswordValidation),
    defaultValues: {
      password: "",
      retypePassword: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof ResetPasswordValidation>) => {
    if (!oobCode || mode !== "resetPassword") {
      return;
    }

    try {
      setIsLoading(true);
      await confirmPasswordReset(auth, oobCode, values.password);
      navigate("/sign-in");
    } catch (error) {
      console.error("Error resetting password:", error);
      setError("Failed to reset password. Please try again or request a new link.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <div className="sm:w-420 flex-center flex-col">
        <img src="/assets/icons/Ricefield_logo.svg" alt="logo" />

        <h2 className="h3-bold md:h2-bold pt-5 sm:pt-12"> Reset Your Password </h2>
        <p className="text-light-3 body-regular md:body-regular mt-2">
          Enter a new password to reset your account.
        </p>

        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-2 w-full">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      className={`shad-input rounded-xl pr-10 ${form.formState.errors.password ? 'border-red-500' : ''}`}
                      {...field}
                      onFocus={() => setIsPasswordFocused(true)}
                    />
                    <img
                      src={showPassword ? "/assets/icons/show password - icon.svg" : "/assets/icons/hide password - icon.svg"}
                      alt={showPassword ? "Show" : "Hide"}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 size-6 cursor-pointer"
                    />
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
          {isPasswordFocused && (
            <PasswordChecklist
              rules={["minLength", "specialChar", "number", "capital"]}
              minLength={8}
              value={form.watch("password")}
              onChange={(isValid) => {
                console.log(isValid);
              }}
            />
          )}

          <FormField
            control={form.control}
            name="retypePassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Retype New Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    className={`shad-input rounded-xl ${form.formState.errors.retypePassword ? 'border-red-500' : ''}`}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {error && <p className="text-red text-center mt-4">{error}</p>}

          <Button type="submit" className="shad-button_primary rounded-full">
            {isLoading ? (
              <div className="flex-center gap-2">
                <Loader /> Loading...
              </div>
            ) : (
              "Reset Password"
            )}
          </Button>
        </form>
      </div>
    </Form>
  );
};

export default ResetPasswordForm;
