import RoomLoveSync from "@/components/RoomLoveSync";

export default async function RoomPage({
  params,
}: {
  params: Promise<{
    roomId: string;
  }>;
}) {
  const { roomId } = await params;
  return <RoomLoveSync roomId={roomId} />;
}

