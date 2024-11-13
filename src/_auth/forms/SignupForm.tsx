import { db } from "@/lib/firebase/config"; // Firestore initialization
import { doc, setDoc, collection, getDocs, query, where } from "firebase/firestore"; 
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { SignupValidation } from "@/lib/validation" 
import { z, ZodIssueCode, ZodError } from 'zod';
import Loader from '../../components/shared/Loader';
import App from '../../App';
import { createUserAccount } from "@/lib/firebase/api";
import React, {useState} from "react";
import PasswordChecklist from "react-password-checklist";
import { auth } from "@/lib/firebase/config";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth"
import { FirebaseError } from "firebase/app"
import Cookies from 'js-cookie';

const SignupForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  //Update validation schema
  const SignupValidation = z.object({
    username: z.string().min(1, "Don't forget to name your farmer!"),
    email: z.string()
    .email("Oops...you forgot this :)")
    .regex(/\.edu$/, "Gotta use your college email (.edu)!"),
    password: z.string().min(8),
    retypePassword: z.string()
    .min(1, "Gotta retype your password!")
  }).superRefine((data, ctx) => {
    if (data.password !== data.retypePassword) {
        ctx.addIssue({
            path: ["retypePassword"],
            message: "Oops...password didn't match :(",
            code: z.ZodIssueCode.custom,
        });
    }
});

    // 1. Define your form.
  const form = useForm<z.infer<typeof SignupValidation>>({
    resolver: zodResolver(SignupValidation),
    defaultValues: {
        username: "",
        email: "",
        password: "",
        retypePassword: ""
    },
  });
 
  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof SignupValidation>) {
    try {
      // Extract school email
      const emailDomain = values.email.substring(values.email.indexOf("@") + 1);

      // Compare school email to existing school document
      const schoolsRef = collection(db, "schools");
      const domainQuery = query(schoolsRef, where("email", "==", emailDomain));
      const querySnapshot = await getDocs(domainQuery);
  
      if (querySnapshot.empty) {
        form.setError("email", { message: "The email domain is not associated with any school" });
        return;
      }
  
      // Extract the school ID 
      let schoolId;
      querySnapshot.forEach((doc) => {
        schoolId = doc.id; 
      });

      // Attempt to create a user with the provided email and password
      const userCredentials = await createUserWithEmailAndPassword(auth, values.email, values.password);

      await sendEmailVerification(userCredentials.user);

      setIsLoading(true);

      // Store user info 
      Cookies.set("userBasicInfo", JSON.stringify({
        uid: userCredentials.user.uid,
        email: values.email,
        username: values.username,
        schoolId: schoolId,
      }), { expires: 7, path: "/" }); // Cookie expires in 7 days

      navigate("/verify-email");
  
    } catch (error) {
      // Typecast the error to FirebaseError
      if (error instanceof FirebaseError) {
        // Handle the case where the email is already in use
        if (error.code === 'auth/email-already-in-use') {
          form.setError("email", { message: "This email already belongs to another farmer" });
        } else {
          // Handle other errors (like network errors, etc.)
          console.error("Error creating user:", error);
          alert("An error occurred while creating the account.");
        }
      } else {
        // If the error is not a Firebase error, log it or handle it accordingly
        console.error("Unknown error:", error);
        alert("An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);  // Reset loading state
    }
  }
  
  return (
    <Form {...form}>
      <div className="sm:w-420 flex-center flex-col">
            <img src= 'public/assets/icons/Ricefield_logo.svg' alt='logo'/>

            <h2 className="h3-bold md:h2-bold pt-5 sm:pt-12"> Howdy, Friend </h2>
            <p className="text-light-3 body-regular md:body-regular mt-2">Create your farmer's identity</p>

        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-2 w-full">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input type="text" className={`shad-input rounded-xl ${form.formState.errors.username? 'border-red-500' : ''}`} {...field} placeholder="coolfarmer"/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    className={`shad-input rounded-xl ${form.formState.errors.email ? 'border-red-500' : ''}`}
                    {...field}
                    placeholder="farmer@yourschool.edu"
                  />
                </FormControl>
                {form.formState.errors.email?.message && (
                  <FormMessage>{form.formState.errors.email.message}</FormMessage>
                )}
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    className={`shad-input rounded-xl pr-10`} // Add right padding for the button
                    {...field}
                    onFocus={() => setIsPasswordFocused(true)}
                  />
                  <img
                    src={showPassword ? "assets/icons/show password - icon.svg" : "assets/icons/hide password - icon.svg"}
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
            rules={["minLength","specialChar","number","capital"]}
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
                <FormLabel>Retype Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    className={`shad-input rounded-xl ${form.formState.errors.retypePassword ? 'border-red-500' : ''}`}
                    {...field}
                    onFocus={() => setIsPasswordFocused(true)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="shad-button_primary rounded-full">

          {isLoading ? (
            <div className="flex-center gap-2">
              <Loader /> Loading...
            </div>
          ) : (
            "Sign up")}
          </Button>

          <p className="text-small-regular text-dark-4 text-center mt-2">
            Already have an account?
            <Link to="/sign-in" className="text-primary-500 text-small-semibold ml-1">Log in</Link>
          </p>
        </form>
      </div>
    </Form>
  )
}

export default SignupForm