import { createFileRoute } from "@tanstack/react-router";
import { FairApp } from "@/components/fair/app";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <FairApp />;
}
