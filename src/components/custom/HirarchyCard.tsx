import { BiLogoGmail } from "react-icons/bi";

export interface Root {
  assignedUnder: number;
  designation: string;
  email: string;
  name: string;
  profileUrl: any;
  userId: number;
}

export default function HirarchyCard({ item, color }: { item: Root, color: string }) {
  return (
    <div className="max-w-50 min-w-50">
      <div className={`p-5 md:px-10 grid grid-cols-1 justify-items-center bg-gray-100 rounded-lg shadow-md border-t-6 border-${color}-500 gap-2`}>
        <img
          src={
            ((item.profileUrl && item.profileUrl.trim().length === 0) ||
            item.profileUrl === null)
              ? "https://betterwaterquality.com/wp-content/uploads/2020/09/dummy-profile-pic-300x300-1-1.png"
              : item.profileUrl
          }
          alt="no image"
          className="w-24 h-24 rounded-full object-cover"
        />
        <p className="font-bold">{item.name}</p>
        <p className="text-blue-600 text-sm font-semibold">{item.designation}</p>
        <div className="font-mono border-t border-gray-300 pt-2 text-gray-500">
          <p className="flex gap-2 items-center text-sm">
            <BiLogoGmail />
            {item.email}
          </p>
        </div>
      </div>
    </div>
  );
}