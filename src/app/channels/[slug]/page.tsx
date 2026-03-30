import ChannelPageClient from "./ChannelPageClient";

export async function generateStaticParams() {
  return [];
}

export default function ChannelPage() {
  return <ChannelPageClient />;
}
