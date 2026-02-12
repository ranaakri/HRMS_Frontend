import { MdCelebration } from "react-icons/md";
import { FaHeart } from "react-icons/fa";
interface Props {
  readonly name: string;
  readonly profileUrl: string;
}

export default function BirthdayMessage({ name, profileUrl }: Props) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex gap-4 border-2 border-l-6 p-10 md:max-w-200 md:min-w-120 m-5 rounded-2xl border-amber-400 bg-amber-50">
        <div className="">
          <img
            src={profileUrl}
            alt="not found"
            width={"80px"}
            className="border rounded-full"
          />
        </div>
        <div className="">
          <p className="text-amber-600 font-semibold flex items-center gap-2"><span className=""><MdCelebration size={25}/></span>BIRTHDAY</p>
          <p className="font-bold md:text-xl">Happy Birthday, {name}</p>
          <p className="text-amber-500 flex items-center gap-2">wish {name} a fantastic Birthday today!<span className="text-amber-600"><FaHeart/></span></p>
          
        </div>
      </div>
    </div>
  );
}
