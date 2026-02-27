import { MdCelebration } from "react-icons/md";
interface Props {
  readonly name: string;
  readonly profileUrl: string;
}

var wishes = [
  "Happy birthday! We hope you have a great day!",

  "All the best on your special day!",

  "Wishing you all the happiness in the world on your birthday!",

  "We hope you have a wonderful birthday and a great year ahead!",

  "Wishing you a happy and prosperous birthday!",

  "May your birthday be filled with lots of love, joy and happiness!",

  "Have a fantastic birthday and enjoy every minute!",

  "May you have a birthday that is as wonderful and amazing as you are!",

  "We hope you have a birthday that is as awesome as you are!",
];

export default function BirthdayMessage({ name, profileUrl }: Props) {
  var index = Math.floor(Math.random() * 10) + 1;
  return (
    <div className="flex gap-4 border-2 border-l-6 p-5 md:max-w-1/2 md:min-w-1/2 m-5 mr-0 rounded-2xl border-amber-400 bg-amber-50">
      <div className="">
        <img
          src={profileUrl}
          alt="not found"
          className="border rounded-full max-w-18 min-w-18 min-h-18 max-h-18 object-cover"
        />
      </div>
      <div className="">
        <p className="text-amber-600 font-semibold flex items-center gap-2">
          <span className="">
            <MdCelebration size={25} />
          </span>
          BIRTHDAY
        </p>
        <p className="font-bold md:text-xl">Happy Birthday, {name}</p>
        <p className="text-amber-500 flex items-center gap-2">
          {wishes[index]}
        </p>
      </div>
    </div>
  );
}
