"use client"

import React from 'react'

import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from 'next/navigation'

import { toast } from "sonner";
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
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

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRightToBracket } from '@fortawesome/free-solid-svg-icons'

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Username must be at least 2 characters.",
    }
    ).max(50, {
        message: "Username must be between 50 characters.",
    }),
    password: z.string().min(2, {
        message: "Password must be at least 4 characters.",
    })
})


export default function SignInForm() {

    let router = useRouter()

    let { error, success } = useSearchParams();

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            password: "",
        },
    })

    useEffect(() => {
        if (error) {
            toast.error(error, {
                toastId: "error",
            });
            error = undefined;
            router.replace("/login");
        }
        if (success) {
            toast.success(success, {
                toastId: "success",
            });
            success = undefined;
            router.replace("/login");
        }
    }, [error, success]);


    const signinSubmit = async (values) => {
        const result = await signIn("signin", {
            redirect: false,
            ...values
        });

        if (!result.error) {
            // const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL + "/api/user", {
            //     method: "GET",
            //     headers: {
            //         "Content-Type": "application/json",
            //         ...values,
            //         signin: true,
            //     },
            // });

            // const user = await res.json();

            // if (
            //     process.env.NODE_ENV !== "development" &&
            //     user.role !== "super" &&
            //     user.role !== "admin" &&
            //     !ALLOWED_IPS?.includes(ip)
            // )
            //     router.replace("/forbidden");
            // else


            console.log("LOGIN SUCCESSFUL")
            console.log(result)
            router.replace("/");
        }
        if (result.error) {
            console.log("LOGIN FAILED")
            console.log(result)
            toast.error(result.error)
        }
    };

    return (
        <>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(signinSubmit)} className="max-w-md mx-auto my-8 p-6 rounded shadow-md space-y-8">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                    <Input type="text" placeholder="John Doe" {...field} />
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
                                    <Input type="password" placeholder="j0hN@123*#" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit"><FontAwesomeIcon className="px-1" icon={faRightToBracket} />  Login to your account</Button>
                </form>
            </Form>
        </>
    )
}
