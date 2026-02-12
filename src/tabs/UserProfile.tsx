import { FaGithub } from "react-icons/fa";
import { BiLogoGmail } from "react-icons/bi";
import { FaPhoneAlt } from "react-icons/fa";

export default function UserProfile() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="md:p-10 p-4 rounded-lg min-w-[90%] m-10 bg-gray-100 shadow-md">
        <div className="flex gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 justify-center items-cente w-full">
            <div className="md:flex text-gray-600 bg-gray-100 font-mono gap-4  ">
              <img
                src="./../public/image.png"
                alt="no image"
                width={"80px"}
                className="rounded-full justify-self-center"
              />
              <div className="mt-4 md:mt-0">
                <p>Id: {121212122}</p>
                <p>Krish</p>
                <p>krish.rana@roimiant.com</p>
              </div>
            </div>
            <div className="text-gray-600 bg-gray-100 font-mono">
              <p>Department: Technical</p>
              <p>Intern {"<Employee>"}</p>
              <p>23/01/2026</p>
            </div>
          </div>
        </div>
        <hr className="my-4 text-gray-300" />
        <div className="grid grid-cols-1 md:grid-cols-3 text-gray-600">
          <p className="flex items-center md:justify-center gap-2">
            <FaGithub />
            github.com/ranaakri
          </p>
          <p className="flex items-center md:justify-center gap-2">
            <BiLogoGmail />
            krish@example.com
          </p>
          <p className="flex items-center md:justify-center gap-2">
            <FaPhoneAlt />
            9098734728
          </p>
        </div>
      </div>
    </div>
  );
}
