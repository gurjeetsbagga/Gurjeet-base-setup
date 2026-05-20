import { redirect } from "next/navigation";

/** Canonical chat home is `/`. */
export default function ChatPage() {
  redirect("/");
}
