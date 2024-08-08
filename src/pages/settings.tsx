import { ActionIcon, CopyButton, Tooltip, rem } from "@mantine/core";
import { useSession } from "next-auth/react";
import { PiCheck, PiCopy } from "react-icons/pi";
import Heading from "~/components/text/heading";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import Layout from "./layout";

const Profile = () => {
  const { data: sessionData } = useSession();
  console.log("sessionData", sessionData);
  return (
    <Layout>
      <Heading>User Settings</Heading>
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <Avatar className="flex h-44 w-44 shrink-0 overflow-hidden rounded-md border border-white/20 p-4">
          <AvatarImage
            src={String(sessionData?.user?.image)}
            alt={String(sessionData?.user?.name)}
          />
          <AvatarFallback>
            {sessionData?.user?.name?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex w-full flex-col flex-wrap px-0 md:px-10">
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
            <p className="flex w-2/3 items-center gap-2 text-[10px] md:text-sm">
              {sessionData?.user?.id}{" "}
              <CopyButton
                timeout={2000}
                value={String(sessionData?.user?.id ?? "")}
              >
                {({ copied, copy }) => (
                  <Tooltip
                    label={copied ? "Copied" : "Copy"}
                    withArrow
                    position="right"
                  >
                    <ActionIcon
                      color={copied ? "teal" : "gray"}
                      variant="subtle"
                      onClick={copy}
                    >
                      {copied ? (
                        <PiCheck style={{ width: rem(16) }} />
                      ) : (
                        <PiCopy style={{ width: rem(16) }} />
                      )}
                    </ActionIcon>
                  </Tooltip>
                )}
              </CopyButton>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
