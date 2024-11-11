import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { auth, db } from '@/lib/firebase/config';
import { doc, setDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from 'zod';
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
import Select from 'react-select';


interface UserData {
  lastname: string;
  firstname: string;
  school: string;
  major: string;
  gradyear: number;
}

const SignupValidation = z.object({
  lastname: z.string().min(2, "Last name must be at least 2 characters long"),
  firstname: z.string().min(2, "First name must be at least 2 characters long"),
  school: z.string().min(1, "Don't forget to add your school!"),
  major: z.string().min(1, "Don't forget to add your major"),
  gradyear: z.string().min(4, "Needs to be a valid school year!").max(4, "Needs to be a valid school year!")
});

function SignupForm2() {
    const form = useForm<z.infer<typeof SignupValidation>>({
        resolver: zodResolver(SignupValidation),
        defaultValues: {
            lastname: "",
            firstname: "",
            school: "",
            major: "",
            gradyear: "",
        },
    });

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: z.infer<typeof SignupValidation>) => {
    try {
        setLoading(true);
        const user = auth.currentUser;
        if (user) {
            await setDoc(doc(db, 'users', user.uid), {
                lastname: data.lastname,
                firstname: data.firstname,
                school: data.school,
                major: data.major,
                gradyear: data.gradyear,
            });
            navigate('/home');
        }
    } catch (error) {
        console.error("Error saving additional data:", error);
    } finally {
        setLoading(false);
    }
};

  return (
    <Form {...form} >
      <div className="sm:w-420 flex-center flex-col">
            <img src= 'public/assets/icons/Ricefield_logo.svg' alt='logo'/>

            <h2 className="h3-bold md:h2-bold pt-5 sm:pt-12"> One last step! </h2>
            <p className="text-light-3 body-regular md:body-regular mt-2">A little more about yourself</p>

          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-2 w-full">

          <FormField
            control={form.control}
            name="lastname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input type="text" className={`shad-input rounded-xl ${form.formState.errors.lastname? 'border-red-500' : ''}`} {...field} placeholder="Doe"/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="firstname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input type="text" className={`shad-input rounded-xl ${form.formState.errors.firstname ? 'border-red-500' : ''}`} {...field} placeholder="John"/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="school"
            render={({ field }) => (
                <FormItem>
                <FormLabel>School</FormLabel>
                <FormControl>
                    <Controller
                    control={form.control}
                    name="school"
                    render={({ field: { onChange, value } }) => (
                        <Select
                        value={value ? { label: value, value } : null}  // Ensures correct value structure
                        onChange={(selectedOption) => onChange(selectedOption?.value)}  // Pass the value to react-hook-form
                        options={[
                            { value: 'Michigan State University', label: 'Michigan State University' },
                            { value: 'Harvard University', label: 'Harvard University' },
                            { value: 'Stanford University', label: 'Stanford University' },
                        ]}
                        isSearchable
                        placeholder="Michigan State University"
                        //styles
                        classNames={{
                            control: () => 'select-control',
                            menu: () => 'select-menu',
                            option: (state) => `select-option ${state.isSelected ? 'select-option--is-selected' : ''}`,
                          }}
                        />
                    )}
                    />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
          <div className="flex gap-2">
            <FormField
                control={form.control}
                name="major"
                render={({ field }) => (
                    <FormItem className="flex-1">
                        <FormLabel>Major</FormLabel>
                        <FormControl>
                            <Input type="text" className={`shad-input rounded-xl ${form.formState.errors.major ? 'border-red-500' : ''}`} {...field} placeholder="Major"/>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                            )}
            />
            <FormField
                control={form.control}
                name="gradyear"
                render={({ field }) => (
                    <FormItem className="flex-1">
                        <FormLabel>Graduation Year</FormLabel>
                        <FormControl>
                            <Input type="text" className={`shad-input rounded-xl ${form.formState.errors.gradyear ? 'border-red-500' : ''}`} {...field} placeholder="2025"/>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
          <Button type="submit" className="shad-button_primary rounded-full mt-4" disabled={loading}>
            {loading ? 'Saving...' : 'Submit'}
          </Button>
          </form>
      </div>     
    </Form>
  );
}

export default SignupForm2;
