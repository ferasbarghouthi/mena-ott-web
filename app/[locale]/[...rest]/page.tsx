import { notFound } from "next/navigation";

// Any unknown path under /ar or /en renders the localized 404.
export default function CatchAll() {
  notFound();
}
