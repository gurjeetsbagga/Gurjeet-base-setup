import { redirect } from "next/navigation";

/** Root URL shows the Figma split login experience */
export default function HomePage() {
  redirect("/login");
}
