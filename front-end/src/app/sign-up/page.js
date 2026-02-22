"use client";

import { useState } from "react";
import Link from "next/link";

export default function Signup() {

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {

            if(password !== confirmPassword){
                alert("Passwords do not match");
                return;
            }

            if(password.length < 6){
                alert("Password must be at least 6 characters");
                return;
            }

            const res = await fetch("http://localhost:4000/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    fullName,
                    email,
                    password
                })
            });

            const data = await res.json();

            alert(data.message);

        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-softBg">

            <div className="max-w-5xl w-full bg-white rounded-3xl shadow-xl overflow-hidden md:flex">

                <div className="hidden md:flex flex-1 items-center justify-center">
                    <img src="/img-login.png" alt="visual"/>
                </div>

                <div className="flex-1 p-10 md:p-14">

                    <h1 className="text-3xl font-semibold text-primary mb-6 text-center">
                        Create Account
                    </h1>

                    <form className="space-y-5" onSubmit={handleSubmit}>

                        <input
                            type="text"
                            placeholder="Enter your name"
                            value={fullName}
                            onChange={(e)=>setFullName(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border"
                        />

                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e)=>setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border"
                        />

                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e)=>setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border"
                        />

                        <input
                            type="password"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e)=>setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border"
                        />

                        <button className="w-full bg-primary hover:bg-primaryDark text-white py-3 rounded-xl">
                            Sign up
                        </button>

                    </form>

                    <p className="text-center mt-6 text-sm">
                        Already have account?{" "}
                        <Link href="/login" className="text-primary">
                            Sign in
                        </Link>
                    </p>

                </div>
            </div>
        </div>
    );
}