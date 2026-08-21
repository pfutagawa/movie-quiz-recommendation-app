import { getRecommendations } from "@/lib/recommendations";
import { CATEGORY_CONFIG } from "@/lib/quiz";
import type { CategoryId } from "@/lib/types";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const categories = (url.searchParams.get("categories") ?? "")
    .split(",")
    .filter((category): category is CategoryId => category in CATEGORY_CONFIG);
  const requestedPage = Number(url.searchParams.get("page") ?? "1");
  const page = Number.isFinite(requestedPage) ? Math.min(Math.max(requestedPage, 1), 10) : 1;

  const response = await getRecommendations(categories, page);

  return Response.json(response, {
    headers: {
      "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=86400",
    },
  });
}
