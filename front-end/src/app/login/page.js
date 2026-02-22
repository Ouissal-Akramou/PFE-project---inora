"use client";

import Link from "next/link";
import { useState } from "react";

export default function Login() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {
    e.preventDefault();

    try {
        const res = await fetch("http://localhost:4000/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                email,
                password
            })
        });

        const data = await res.json();
        console.log(data);

        if(res.ok){
            alert("Login successful");
        } else {
            alert(data.message);
        }

    } catch (error) {
        console.log(error);
    }
};

    return (
        <div className="min-h-screen flex items-center justify-center bg-softBg">

            <div className="max-w-5xl w-full bg-white rounded-3xl shadow-xl overflow-hidden md:flex">

                <div className="hidden md:flex flex-1 items-center justify-center">
                    <img src="/side.png" alt="visual" />
                </div>

                <div className="flex-1 p-10 md:p-14">

                    <img src="/graduation cap.png" alt="visual" className="w-20 ml-[190px]" />

                    <h1 className="text-3xl font-semibold text-primary mb-2 ml-[120px]">
                        Welcome Back!
                    </h1>

                    <p className="text-softGray mb-8 ml-[70px]">
                        We missed you! Please enter your details
                    </p>

                    <form className="space-y-5" onSubmit={handleSubmit}>

                        {/* Email */}
                        <div>
                            <label className="block text-[20px] text-black mb-2">
                                Email
                            </label>

                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-softGray/30 bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-[20px] text-black mb-2">
                                Password
                            </label>

                            <input
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-softGray/30 bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                            />
                        </div>

                        {/* Options */}
                        <div className="flex justify-between items-center text-sm">
                            <label className="flex items-center gap-2 text-softGray">
                                <input
                                    type="checkbox"
                                    className="accent-primary scale-125"
                                />
                                Remember me
                            </label>

                            <Link href="/forgot-password" className="text-primary hover:text-primaryDark transition">
                                Forgot password?
                            </Link>
                        </div>

                        {/* Button */}
                        <button
                            type="submit"
                            className="w-full bg-primary hover:bg-primaryDark text-white py-3 rounded-xl transition duration-300 shadow-md hover:shadow-lg"
                        >
                            Sign in
                        </button>

                    </form>

                    <p className="text-sm text-softGray mt-6 ml-[120px]">
                        Don’t have an account?{" "}
                        <Link href="/sign-up" className="text-primary hover:text-primaryDark font-medium transition">
                            Sign up
                        </Link>
                    </p>

                </div>
            </div>
        </div>
    );
}