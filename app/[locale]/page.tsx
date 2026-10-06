import { HomeView } from "@/components/views/home";
import { api } from "@/lib/api/client";

export default async function Home() {
  const [packages, channels, categories, countries] = await Promise.all([
    api.catalog.packages(),
    api.catalog.channels(),
    api.catalog.categories(),
    api.catalog.countries(),
  ]);
  return <HomeView packages={packages} channels={channels.slice(0, 6)} categories={categories} countries={countries} />;
}
