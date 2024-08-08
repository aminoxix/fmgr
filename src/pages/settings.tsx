import { useSession } from "next-auth/react";
import Heading from "~/components/text/heading";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import Layout from "./layout";

const Profile = () => {
  const { data: sessionData } = useSession();
  console.log("sessionData", sessionData);
  return (
    <Layout>
      <Heading>User Settings</Heading>
      <div className="flex items-center justify-between">
        <Avatar className="flex h-44 w-44 shrink-0 overflow-hidden rounded-md border border-white/20 p-4">
          <AvatarImage
            src={String(sessionData?.user?.image)}
            alt={String(sessionData?.user?.name)}
          />
          <AvatarFallback>
            {sessionData?.user?.name?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex w-full flex-col flex-wrap px-10">
          <div className="flex flex-wrap items-center justify-around">
            <h3 className="w-1/3 text-lg font-semibold">Name</h3>
            <p className="w-2/3">{sessionData?.user?.name}</p>
          </div>
          <div className="flex items-center justify-around">
            <h3 className="w-1/3 text-lg font-semibold">Email</h3>
            <p className="w-2/3">{sessionData?.user?.email}</p>
          </div>
          <div className="flex items-center justify-around">
            <h3 className="w-1/3 text-lg font-semibold">ID</h3>
            <p className="w-2/3 text-sm">{sessionData?.user?.id}</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
