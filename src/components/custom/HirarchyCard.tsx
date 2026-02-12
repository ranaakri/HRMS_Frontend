import { AiFillProduct } from "react-icons/ai";
import { FaGithub } from "react-icons/fa";
import { BiLogoGmail } from "react-icons/bi";
import { FaPhoneAlt } from "react-icons/fa";

interface Props {
  readonly profileUrl: string;
  readonly name: string;
  readonly designation: string;
  readonly department: string;
  readonly git: string;
  readonly email: string;
  readonly contact: string;
}

export default function HirarchyCard({
  profileUrl,
  name,
  designation,
  department,
  git,
  email,
  contact,
}: Props) {
  return (
    <div className="w-full min-h-screen flex justify-center items-center">
      <div className="p-10 md:px-20 grid grid-cols-1 justify-items-center bg-gray-100 rounded-lg shadow-md border-t-6 border-blue-500 gap-2">
        <img
          src={profileUrl}
          alt="no image"
          className="w-24 h-24 rounded-full object-cover"
        />
        <p className="font-bold text-xl">{name}</p>
        <p className="text-blue-600 font-semibold">{designation}</p>
        <p className="flex items-center gap-2 bg-gray-300 px-4 rounded-full text-sm mb-2"><AiFillProduct />{department}</p>
        <div className="font-mono border-t border-gray-300 pt-2 text-gray-500">
          <p className="flex gap-2 items-center"><FaPhoneAlt/>{contact}</p>
          <p className="flex gap-2 items-center"><BiLogoGmail />{email}</p>
          <p className="flex gap-2 items-center"><FaGithub/>{git}</p>
        </div>
      </div>
    </div>
  );
}
