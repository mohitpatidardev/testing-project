import CollaborativeRoom from "@/components/CollaborativeRoom";
import { getDocument } from "@/lib/actions/room.actions";
import { getClerkUsers } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const Document = async ({ params: { id } }: SearchParamProps) => {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect('/sign-in');

  const room = await getDocument({
    roomId: id,
    userId: clerkUser.emailAddresses[0].emailAddress,
  });

  if (!room) redirect('/');

  const userIds = Object.keys(room.usersAccesses);
  const users = await getClerkUsers({ userIds });

  // Safely map usersData to ensure null safety on email access
  const usersData = users.map((user: User) => {
    const userEmail = user?.email; // Safely access user.email
    const userAccess = userEmail ? room.usersAccesses[userEmail] : null;
    return {
      ...user,
      userType: userAccess?.includes('room:write') ? 'editor' : 'viewer',
    };
  });

  const currentUserEmail = clerkUser.emailAddresses[0].emailAddress;
  const currentUserType = room.usersAccesses[currentUserEmail]?.includes('room:write') ? 'editor' : 'viewer';

  return (
    <main className="flex w-full flex-col items-center">
      <CollaborativeRoom 
        roomId={id}
        roomMetadata={room.metadata}
        users={usersData}
        currentUserType={currentUserType}
      />
    </main>
  );
};

export default Document;
