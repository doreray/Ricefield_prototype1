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
import { SigninValidation } from "@/lib/validation"
import { z } from 'zod';
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase/config"

const SigninForm = () => {
  const form = useForm<z.infer<typeof SigninValidation>>({
    resolver: zodResolver(SigninValidation),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: z.infer<typeof SigninValidation>) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      console.log('Logged in:', userCredential.user);
      navigate('/home'); // redirect after successful login
    } catch (error) {
      if (error instanceof Error) {
        setError('Invalid email or password. Please try again.');
      }
    }
  };

  return (
    <Form {...form}>
      <div className="sm:w-420 flex-center flex-col">
        <img src='public/assets/icons/Ricefield_logo.svg' alt='logo' />

        <h2 className="h3-bold md:h2-bold pt-5 sm:pt-12"> It's time to cook! </h2>
        <p className="text-light-3 body-regular md:body-regular mt-2">Log in with your credentials</p>

        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-2 w-full">

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" className={`shad-input rounded-xl ${form.formState.errors.email ? 'border-red-500' : ''}`} {...field} />
                </FormControl>
                <FormMessage />
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
                    />
                    <img
                      src={showPassword ? "assets/icons/show password - icon.svg" : "assets/icons/hide password - icon.svg"}
                      alt={showPassword ? "Show" : "Hide"}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 size-6 cursor-pointer"
                    />
                  </div>
                </FormControl>
                <FormDescription className="pt-1">
                  <Link to="/pre-reset-password" className="text-primary-500 text-sm ml-1">Forgot Password?</Link>
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {error && <p className="text-red text-center mt-4">{error}</p>}

          <Button type="submit" className="shad-button_primary rounded-full mt-4"> Log In </Button>

          <p className="text-small-regular text-dark-4 text-center mt-2">
            First time in the field?
            <Link to="/sign-up" className="text-primary-500 text-small-semibold ml-1">Sign up</Link>
          </p>
        </form>
      </div>
    </Form>
  )
}

export default SigninForm
