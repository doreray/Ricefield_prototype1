import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { z } from "zod";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
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
import { useNavigate } from "react-router-dom";


const PreResetPasswordValidation = z.object({
    email: z
        .string()
        .min(1, "Please enter your email")
        .email("Please enter a valid email"),
});

const PreResetPassword = () => {
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const form = useForm<z.infer<typeof PreResetPasswordValidation>>({
        resolver: zodResolver(PreResetPasswordValidation),
        defaultValues: { email: "" },
    });

    const onSubmit = async (data: z.infer<typeof PreResetPasswordValidation>) => {
        try {
            await sendPasswordResetEmail(auth, data.email);
            setSuccess(true);
            navigate("/email-reset-password");
        } catch (error) {
            setError("Failed to send reset email. Please try again.");
        }
    };

    return (
        <Form {...form}>
            <div className="sm:w-420 flex-center flex-col">
                <img src="public/assets/icons/Ricefield_logo.svg" alt="logo" />
                <h2 className="h3-bold md:h2-bold pt-5 sm:pt-12">Reset your password</h2>
                <p className="text-dark-1 body-regular md:body-regular mt-4">
                    Enter your email below, and we’ll send you a link to reset your password.
                </p>

                {success ? (
                    <p className="text-green-600 mt-4 text-center">
                        A password reset email has been sent to your email address.
                    </p>
                ) : (
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-2 w-full mt-6">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            className={`shad-input rounded-xl ${form.formState.errors.email ? "border-red-500" : ""}`}
                                            {...field}
                                            placeholder="farmer@example.edu"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

                        <Button type="submit" className="shad-button_primary rounded-full mt-4">
                            Send Reset Email
                        </Button>
                    </form>
                )}
            </div>
        </Form>
    );
};

export default PreResetPassword;
