import Link from "next/link";

export default function ForgotPassword() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-softBg">

      <div className="max-w-5xl w-full bg-white rounded-3xl shadow-xl overflow-hidden md:flex">

        {/* LEFT IMAGE */}
        <div className="hidden md:flex flex-1 items-center justify-center">
          <img src="/side.png" alt="visual" />
        </div>

        {/* RIGHT SIDE */}
        <div className="flex-1 p-10 md:p-14">

          {/* Top Icon */}
          <div className="flex justify-center mb-4">
            <img src="/graduation cap.png" alt="visual" className="w-20" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-semibold text-primary text-center mb-2">
            Forgot Password
          </h1>

          <p className="text-softGray text-center mb-8">
            Enter your email to receive a reset link
          </p>

          <form className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-lg font-medium text-gray-800 mb-2">
                Email
              </label>

              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-xl border border-softGray/30 bg-white 
                focus:outline-none focus:border-primary focus:ring-2 
                focus:ring-primary/20 transition duration-200"
              />
            </div>

            {/* Button */}
            <button
              type="submit"
              className="w-full bg-primary hover:bg-primaryDark text-white py-3 
              rounded-xl transition duration-300 shadow-md hover:shadow-lg"
            >
              Send Reset Link
            </button>

          </form>

          <p className="text-sm text-softGray mt-6 text-center">
            Remember your password?{" "}
            <Link
              href="/login"
              className="text-primary hover:text-primaryDark font-medium transition"
            >
              Sign in
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}