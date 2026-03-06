import api from "@/api/api";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { Link, Outlet, useLocation, useParams } from "react-router-dom";

interface ProfilePostCounts {
  profile: Profile;
  mentionsCount: number;
  likeCount: number;
  postCount: number;
}

interface Profile {
  userId: number;
  name: string;
  profileUrl: string;
  email: string;
}

const formatCount = (num: number) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num.toString();
};

export default function ProfilePage({ myPage }: { myPage: boolean }) {
  const { user } = useAuth();
  const location = useLocation();

  const { userId } = useParams();

  const profilePostData = useQuery<ProfilePostCounts>({
    queryKey: ["ProfilePostCounts", user?.userId, userId],
    queryFn: () => {
      let baseUrl = myPage
        ? `/post/profile/count/${user?.userId}`
        : `/post/profile/count/${userId}`;
      return api.get(baseUrl).then((res) => res.data);
    },
    enabled: !!(userId || user?.userId),
  });

  if (profilePostData.isLoading)
    return <div className="text-center py-10">Loading...</div>;

  const isMentions = location.pathname.endsWith("/mentions");
  const isPost =
    location.pathname.endsWith(
      "/profile-view/" + location.pathname.split("/")[4],
    ) || location.pathname.endsWith("/profile");
  const isArchived = location.pathname.endsWith("/archived");

  return (
    <div className="max-w-4xl mx-auto px-4 space-y-8">
      <Card className="bg-white shadow-sm border-0 p-8 rounded-2xl">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <img
            src={profilePostData.data?.profile.profileUrl}
            className="w-32 h-32 rounded-full object-cover border-4 border-gray-50 shadow-sm"
            alt="Profile"
          />

          <div className="flex-1 space-y-4 text-center md:text-left">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {profilePostData.data?.profile.name}
              </h1>
              <p className="text-gray-500">
                {profilePostData.data?.profile.email}
              </p>
            </div>

            <div className="flex justify-center md:justify-start gap-8 pt-2">
              <div className="text-center">
                <p className="text-xl font-bold text-gray-900">
                  {formatCount(profilePostData.data?.postCount || 0)}
                </p>
                <p className="text-sm text-gray-500">Posts</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-gray-900">
                  {formatCount(profilePostData.data?.likeCount || 0)}
                </p>
                <p className="text-sm text-gray-500">Likes</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-gray-900">
                  {formatCount(profilePostData.data?.mentionsCount || 0)}
                </p>
                <p className="text-sm text-gray-500">Mentions</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          <Link
            to=""
            replace
            className={`pb-4 text-sm font-medium transition-all relative ${
              isPost ? "text-black" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Posts
            {isPost && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black" />
            )}
          </Link>
          <Link
            to="mentions"
            replace
            className={`pb-4 text-sm font-medium transition-all relative ${
              isMentions ? "text-black" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Mentions
            {isMentions && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black" />
            )}
          </Link>
          {myPage && (
            <Link
              to="archived"
              replace
              className={`pb-4 text-sm font-medium transition-all relative ${
                isArchived ? "text-black" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Archived
              {isArchived && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black" />
              )}
            </Link>
          )}
        </nav>
      </div>

      <div className="pt-4">
        <Outlet />
      </div>
    </div>
  );
}
