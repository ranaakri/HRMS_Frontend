import { useState } from "react";
import { BsClipboard2Check } from "react-icons/bs";
import { FaEnvelope, FaKey, FaLockOpen } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import api from "@/api/api";
import { notify } from "@/components/custom/Notification";

interface IEmailForm {
  email: string;
}

interface IOtpForm {
  otp: string;
}

interface IPasswordForm {
  password: string;
  confirmPassword: string;
}

type Step = "EMAIL" | "OTP" | "PASSWORD";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("EMAIL");
  const [email, setEmail] = useState<string>("");
  const [resetToken, setResetToken] = useState<string>();

  const emailForm = useForm<IEmailForm>();
  const otpForm = useForm<IOtpForm>();
  const passwordForm = useForm<IPasswordForm>();

  const sendOtp = useMutation({
    mutationFn: async (data: IEmailForm) =>
      api.post(`/auth/forgot-password?email=${data.email}`),

    onSuccess: (_, variables) => {
      setEmail(variables.email);
      setStep("OTP");
      notify.success("Success", "OTP sent to your email");
    },

    onError: (error: any) => {
      notify.error(
        "Error",
        error?.response?.data?.message ?? "Failed to send OTP"
      );
    },
  });

  const verifyOtp = useMutation({
    mutationFn: async (data: IOtpForm) =>
      api.post("/auth/verify-otp", {
        email,
        otp: data.otp,
      }).then((res) => res.data),

    onSuccess: (data) => {
      setStep("PASSWORD");
      setResetToken(data);
      notify.success("Success", "OTP verified successfully");
    },

    onError: (error: any) => {
      notify.error(
        "Error",
        error?.response?.data?.message ?? "Invalid OTP"
      );
    },
  });

  const resetPassword = useMutation({
    mutationFn: async (data: IPasswordForm) =>
      api.post("/auth/reset-password", {
        email,
        password: data.password,
        resetToken: resetToken,
      }),

    onSuccess: () => {
      notify.success("Success", "Password reset successfully");
      navigate("/login");
    },

    onError: (error: any) => {
      notify.error(
        "Error",
        error?.response?.data?.message ?? "Failed to reset password"
      );
    },
  });

  const onEmailSubmit = (data: IEmailForm) => {
    sendOtp.mutate(data);
  };

  const onOtpSubmit = (data: IOtpForm) => {
    verifyOtp.mutate(data);
  };

  const onPasswordSubmit = (data: IPasswordForm) => {
    if (data.password !== data.confirmPassword) {
      passwordForm.setError("confirmPassword", {
        message: "Passwords do not match",
      });
      return;
    }

    resetPassword.mutate(data);
  };

  return (
<div className="w-full min-h-screen flex justify-center bg-linear-to-t from-sky-500 to-black shadow-lg overflow-hidden">
      <div className="text-white rounded-t-xl w-full md:w-150">
        <div className="m-10">
          <div className="text-xl font-semibold mb-3 flex items-center gap-2">
            <div className="text-white p-2 rounded border-blue-600 border-2 bg-blue-400">
              <BsClipboard2Check />
            </div>
            HRMS Portal
          </div>

          <p className="text-2xl font-semibold">Account Recovery</p>
          <p>Reset your password securely</p>
        </div>

        <div className="mt-10 min-h-full border bg-white text-black px-5 md:px-10 pt-5 rounded-4xl shadow-xl shadow-white border-white">
          {step === "EMAIL" && (
            <form
              onSubmit={emailForm.handleSubmit(onEmailSubmit)}
              className="flex flex-col gap-3"
            >
              <div className="flex justify-center">
                <div className="border-2 border-blue-600 bg-blue-400 p-3 text-white rounded-full">
                  <FaEnvelope />
                </div>
              </div>

              <h2 className="text-center text-2xl font-semibold">
                Forgot Password
              </h2>

              <div>
                <label htmlFor="email" className="font-semibold">Email Address</label>
                <input
                  type="email"
                  id="email"
                  {...emailForm.register("email", {
                    required: "Email is required",
                    pattern: {
                      value:
                        /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                  placeholder="name@example.com"
                  className="w-full p-2 mt-1 bg-gray-200 border border-gray-400 rounded-md"
                />
                {emailForm.formState.errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {emailForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={sendOtp.isPending}
                className="p-2 mb-4 bg-blue-400 text-white rounded-full hover:bg-blue-600 duration-200 disabled:opacity-60"
              >
                {sendOtp.isPending ? "Sending OTP..." : "Send OTP"}
              </button>
            </form>
          )}

          {step === "OTP" && (
            <form
              onSubmit={otpForm.handleSubmit(onOtpSubmit)}
              className="flex flex-col gap-3"
            >
              <div className="flex justify-center">
                <div className="border-2 border-blue-600 bg-blue-400 p-3 text-white rounded-full">
                  <FaKey />
                </div>
              </div>

              <h2 className="text-center text-2xl font-semibold">
                Verify OTP
              </h2>

              <div>
                <label htmlFor="otp" className="font-semibold">Enter OTP</label>
                <input
                  type="text"
                  id="otp"
                  maxLength={6}
                  {...otpForm.register("otp", {
                    required: "OTP is required",
                    pattern: {
                      value: /^[0-9]{6}$/,
                      message: "OTP must be 6 digits",
                    },
                  })}
                  placeholder="Enter 6-digit OTP"
                  className="w-full p-2 mt-1 bg-gray-200 border border-gray-400 rounded-md"
                />
                {otpForm.formState.errors.otp && (
                  <p className="text-red-500 text-sm mt-1">
                    {otpForm.formState.errors.otp.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={verifyOtp.isPending}
                className="p-2 mb-4 bg-blue-400 text-white rounded-full hover:bg-blue-600 duration-200 disabled:opacity-60"
              >
                {verifyOtp.isPending ? "Verifying..." : "Verify OTP"}
              </button>
            </form>
          )}

          {step === "PASSWORD" && (
            <form
              onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
              className="flex flex-col gap-3"
            >
              <div className="flex justify-center">
                <div className="border-2 border-blue-600 bg-blue-400 p-3 text-white rounded-full">
                  <FaLockOpen />
                </div>
              </div>

              <h2 className="text-center text-2xl font-semibold">
                Reset Password
              </h2>

              <div>
                <label htmlFor="password" className="font-semibold">New Password</label>
                <input
                  type="password"
                  id="password"
                  {...passwordForm.register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message:
                        "Password must be at least 6 characters",
                    },
                  })}
                  placeholder="Enter new password"
                  className="w-full p-2 mt-1 bg-gray-200 border border-gray-400 rounded-md"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="font-semibold">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  {...passwordForm.register("confirmPassword", {
                    required: "Confirm Password is required",
                  })}
                  placeholder="Confirm new password"
                  className="w-full p-2 mt-1 bg-gray-200 border border-gray-400 rounded-md"
                />
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {
                      passwordForm.formState.errors.confirmPassword
                        .message
                    }
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={resetPassword.isPending}
                className="p-2 mb-4 bg-blue-400 text-white rounded-full hover:bg-blue-600 duration-200 disabled:opacity-60"
              >
                {resetPassword.isPending
                  ? "Resetting..."
                  : "Reset Password"}
              </button>
            </form>
          )}

          <hr className="my-4 text-gray-300" />

          <div className="flex justify-center pb-4">
            <p>
              Remember your password?{" "}
              <span
                className="text-blue-600 hover:underline cursor-pointer"
                onClick={() => navigate("/login")}
              >
                Sign in
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}