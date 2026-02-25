import { BsClipboard2Check } from "react-icons/bs";
import { FaLockOpen } from "react-icons/fa";
import { getCookie, useAuth, type Role } from "@/context/AuthContext";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import api from "@/api/api";
import { notify } from "@/components/custom/Notification";

interface IForm {
  email: string;
  password: string;
}

export interface Data {
  userId: number;
  email: string;
  role: Role;
  profileUrl: string;
  name: string;
}

export default function LoginPage() {
  const { setLoggedin, setUser } = useAuth();
  const navigate = useNavigate();

  if (getCookie("LoggedIn")) {
    navigate("/", { replace: true });
    setLoggedin(true);
    return;
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IForm>();

  const login = useMutation({
    mutationFn: async (data: IForm) => {
      return await api.post<Data>("/auth/login", data).then((res) => res.data);
    },
    onSuccess: () => {
      notify.success("Login Success", "You have logged in successfully");
      return;
    },
    onError: (error: any) => {
      notify.error("Login faild", error.response.data.message);
      console.error(error.response);
      return;
    },
  });

  const onSubmit = async (data: IForm) => {
    const payload = {
      email: data.email,
      password: data.password,
    };
    const res = await login.mutateAsync(payload);
    localStorage.setItem("user", JSON.stringify(res));
    if (res) setUser(res);
    setLoggedin(true);
    navigate("/", { replace: true });
  };

  return (
    <div className="w-full min-h-screen flex justify-center bg-linear-to-t from-sky-500 to-black shadow-lg overflow-hidden">
      <div className="text-white rounded-t-xl w-full md:w-150">
        <div className="m-10">
          <div className="text-xl font-semibold mb-3 flex items-center gap-2">
            <div className=" text-white p-2 rounded border-blue-600 border-2 bg-blue-400">
              <BsClipboard2Check />
            </div>
            HRMS Portal
          </div>
          <p className="text-2xl font-semibold">
            Your Travel and Event Manager...
          </p>
          <p>Access your dashboard securely</p>
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-10 min-h-full border bg-white text-black px-5 md:px-10 pt-5 rounded-4xl shadow-xl shadow-white border-white"
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-center">
              <div className="border-2 border-blue-600 bg-blue-400 p-3 text-white rounded-full">
                <FaLockOpen />
              </div>
            </div>
            <h2 className="text-center text-2xl font-semibold">
              Secure Sign in
            </h2>

            <div className="flex flex-col p-2">
              <label htmlFor="email" className="font-semibold">
                Email Address
              </label>
              <input
                type="text"
                id="email"
                {...register("email", {
                  required: "Email is required",
                })}
                placeholder="name@roimiant.com"
                className="p-2 text-gray-500 bg-gray-200 border border-gray-400 rounded-md duration-20"
              />
            </div>

            {errors.email && (
              <p className="text-red-500 pl-2">{errors.email.message}</p>
            )}

            <div className="flex flex-col p-2">
              <label htmlFor="pass" className="font-semibold">
                Password
              </label>
              <input
                type="password"
                id="pass"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be 6 characters",
                  },
                })}
                placeholder="name@roimiant.com"
                className="p-2 text-gray-500 bg-gray-200 border border-gray-400 rounded-md duration-20"
              />
            </div>

            {errors.password && (
              <p className="text-red-500 pl-2">{errors.password.message}</p>
            )}

            <button
              type="submit"
              disabled={login.isPending ? true : false}
              className="p-2 mb-4 border bg-blue-300 text-white rounded-full hover:bg-blue-500 duration-200 m-2 cursor-pointer"
            >
              Sign in
            </button>
          </div>

          <hr className="m-4 text-gray-300" />

          <div className="flex items-center justify-center">
            <p className="">
              Don't have an account?{" "}
              <a href="#" className="text-blue-600 hover:underline">
                Contact HR
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
