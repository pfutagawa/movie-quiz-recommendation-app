import { CATEGORY_CONFIG } from "@/lib/quiz";
import type {
  CategoryId,
  Recommendation,
  RecommendationResponse,
  StreamingProvider,
} from "@/lib/types";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_URL = "https://image.tmdb.org/t/p";
const PREFERRED_PROVIDER_IDS = [8, 119, 337, 1899];
const PREFERRED_PROVIDER_PATTERN = /netflix|prime video|disney|hbo|max/i;

const TV_GENRES: Record<CategoryId, number> = {
  "sci-fi": 10765,
  action: 10759,
  comedy: 35,
  drama: 18,
  horror: 9648,
  fantasy: 10765,
  animation: 16,
  crime: 80,
  romance: 18,
  documentary: 99,
};

const demoTitles: Array<Omit<Recommendation, "providers">> = [
  { id: 329865, mediaType: "movie", title: "A Chegada", year: "2016", overview: "Uma linguista tenta compreender visitantes extraterrestres antes que a tensão global se torne irreversível.", rating: 7.6, tmdbUrl: "https://www.themoviedb.org/movie/329865", category: "sci-fi" },
  { id: 42009, mediaType: "tv", title: "Black Mirror", year: "2011", overview: "Uma antologia inquietante sobre tecnologia, sociedade e as contradições do futuro próximo.", rating: 8.3, tmdbUrl: "https://www.themoviedb.org/tv/42009", category: "sci-fi" },
  { id: 76341, mediaType: "movie", title: "Mad Max: Estrada da Fúria", year: "2015", overview: "Furiosa cruza um deserto brutal em uma fuga eletrizante contra um tirano e seu exército.", rating: 7.6, tmdbUrl: "https://www.themoviedb.org/movie/76341", category: "action" },
  { id: 108978, mediaType: "tv", title: "Reacher", year: "2022", overview: "Um ex-investigador militar encontra conspirações perigosas enquanto atravessa pequenas cidades.", rating: 8.0, tmdbUrl: "https://www.themoviedb.org/tv/108978", category: "action" },
  { id: 120467, mediaType: "movie", title: "O Grande Hotel Budapeste", year: "2014", overview: "Um concierge lendário e seu jovem aprendiz se envolvem em uma herança, um roubo e uma fuga improvável.", rating: 8.0, tmdbUrl: "https://www.themoviedb.org/movie/120467", category: "comedy" },
  { id: 67070, mediaType: "tv", title: "Fleabag", year: "2016", overview: "Humor afiado e vulnerabilidade acompanham uma mulher tentando reorganizar a vida em Londres.", rating: 8.3, tmdbUrl: "https://www.themoviedb.org/tv/67070", category: "comedy" },
  { id: 496243, mediaType: "movie", title: "Parasita", year: "2019", overview: "Duas famílias de classes opostas se aproximam em uma trama imprevisível sobre desigualdade e desejo.", rating: 8.5, tmdbUrl: "https://www.themoviedb.org/movie/496243", category: "drama" },
  { id: 76331, mediaType: "tv", title: "Succession", year: "2018", overview: "Os herdeiros de um império de mídia disputam afeto, poder e o controle da empresa familiar.", rating: 8.3, tmdbUrl: "https://www.themoviedb.org/tv/76331", category: "drama" },
  { id: 419430, mediaType: "movie", title: "Corra!", year: "2017", overview: "Uma visita à família da namorada revela uma ameaça construída sob aparências cuidadosamente cordiais.", rating: 7.6, tmdbUrl: "https://www.themoviedb.org/movie/419430", category: "horror" },
  { id: 72844, mediaType: "tv", title: "A Maldição da Residência Hill", year: "2018", overview: "Irmãos confrontam as memórias e assombrações da casa onde cresceram.", rating: 8.1, tmdbUrl: "https://www.themoviedb.org/tv/72844", category: "horror" },
  { id: 1417, mediaType: "movie", title: "O Labirinto do Fauno", year: "2006", overview: "Na Espanha franquista, uma menina encontra um reino fantástico tão fascinante quanto ameaçador.", rating: 7.8, tmdbUrl: "https://www.themoviedb.org/movie/1417", category: "fantasy" },
  { id: 90802, mediaType: "tv", title: "Sandman", year: "2022", overview: "Após um século aprisionado, o senhor dos sonhos precisa reconstruir seu reino e reparar antigos erros.", rating: 8.0, tmdbUrl: "https://www.themoviedb.org/tv/90802", category: "fantasy" },
  { id: 324857, mediaType: "movie", title: "Homem-Aranha no Aranhaverso", year: "2018", overview: "Miles Morales encontra heróis de outras dimensões e descobre sua própria maneira de usar a máscara.", rating: 8.4, tmdbUrl: "https://www.themoviedb.org/movie/324857", category: "animation" },
  { id: 94605, mediaType: "tv", title: "Arcane", year: "2021", overview: "Duas irmãs ficam em lados opostos do conflito entre as cidades de Piltover e Zaun.", rating: 8.7, tmdbUrl: "https://www.themoviedb.org/tv/94605", category: "animation" },
  { id: 598, mediaType: "movie", title: "Cidade de Deus", year: "2002", overview: "Buscapé registra com sua câmera a transformação da comunidade onde cresceu e a escalada da violência.", rating: 8.4, tmdbUrl: "https://www.themoviedb.org/movie/598", category: "crime" },
  { id: 67744, mediaType: "tv", title: "Mindhunter", year: "2017", overview: "Agentes do FBI entrevistam homicidas para compreender padrões e desenvolver a análise criminal moderna.", rating: 8.1, tmdbUrl: "https://www.themoviedb.org/tv/67744", category: "crime" },
  { id: 76, mediaType: "movie", title: "Antes do Amanhecer", year: "1995", overview: "Dois jovens transformam uma noite caminhando por Viena em um encontro inesquecível.", rating: 8.0, tmdbUrl: "https://www.themoviedb.org/movie/76", category: "romance" },
  { id: 89905, mediaType: "tv", title: "Normal People", year: "2020", overview: "Marianne e Connell atravessam anos de intimidade, desencontros e amadurecimento.", rating: 8.1, tmdbUrl: "https://www.themoviedb.org/tv/89905", category: "romance" },
  { id: 566221, mediaType: "movie", title: "Democracia em Vertigem", year: "2019", overview: "Uma perspectiva pessoal sobre a crise política brasileira e a fragilidade das instituições democráticas.", rating: 7.7, tmdbUrl: "https://www.themoviedb.org/movie/566221", category: "documentary" },
  { id: 1044, mediaType: "tv", title: "Planeta Terra", year: "2006", overview: "Uma viagem por ecossistemas extraordinários e pelas espécies que habitam o planeta.", rating: 8.6, tmdbUrl: "https://www.themoviedb.org/tv/1044", category: "documentary" }
];

const demoProvider: StreamingProvider = {
  id: 0,
  name: "API necessária para consultar o streaming",
};

function getCredentials() {
  return {
    token: process.env.TMDB_API_READ_TOKEN?.trim(),
    apiKey: process.env.TMDB_API_KEY?.trim(),
  };
}

async function tmdbFetch<T>(path: string, params: Record<string, string | number>) {
  const credentials = getCredentials();
  const url = new URL(`${TMDB_BASE_URL}${path}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, String(value)));

  const headers: HeadersInit = { accept: "application/json" };
  if (credentials.token) headers.Authorization = `Bearer ${credentials.token}`;
  else if (credentials.apiKey) url.searchParams.set("api_key", credentials.apiKey);
  else throw new Error("TMDB credentials are not configured");

  const response = await fetch(url, {
    headers,
    next: { revalidate: 21_600 },
  });

  if (!response.ok) throw new Error(`TMDB request failed with ${response.status}`);
  return (await response.json()) as T;
}

interface TmdbDiscoverItem {
  id: number;
  title?: string;
  name?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
}

interface TmdbDiscoverResponse {
  results: TmdbDiscoverItem[];
}

interface TmdbProviderResponse {
  results?: Record<
    string,
    {
      link?: string;
      flatrate?: Array<{
        provider_id: number;
        provider_name: string;
        logo_path?: string | null;
      }>;
    }
  >;
}

async function discover(
  mediaType: "movie" | "tv",
  category: CategoryId,
  page: number,
) {
  const genreId = mediaType === "movie" ? CATEGORY_CONFIG[category].genreId : TV_GENRES[category];
  const result = await tmdbFetch<TmdbDiscoverResponse>(`/discover/${mediaType}`, {
    language: "pt-BR",
    page,
    sort_by: "vote_average.desc",
    "vote_count.gte": mediaType === "movie" ? 250 : 100,
    watch_region: "BR",
    with_watch_monetization_types: "flatrate",
    with_watch_providers: PREFERRED_PROVIDER_IDS.join("|"),
    with_genres: genreId,
    include_adult: "false",
  });

  return result.results.slice(0, 7).map((item) => ({ item, mediaType, category }));
}

async function providersFor(mediaType: "movie" | "tv", id: number) {
  const result = await tmdbFetch<TmdbProviderResponse>(`/${mediaType}/${id}/watch/providers`, {});
  const brazil = result.results?.BR;
  const all = brazil?.flatrate ?? [];
  const preferred = all.filter((provider) => PREFERRED_PROVIDER_PATTERN.test(provider.provider_name));
  const chosen = (preferred.length ? preferred : all).slice(0, 4);

  return {
    providers: chosen.map((provider) => ({
      id: provider.provider_id,
      name: provider.provider_name,
      logoUrl: provider.logo_path ? `${TMDB_IMAGE_URL}/w92${provider.logo_path}` : undefined,
    })),
  };
}

function deterministicOrder(id: number, page: number) {
  const day = Math.floor(Date.now() / 86_400_000);
  return ((id * 9301 + page * 49297 + day * 233) % 233_280) / 233_280;
}

export async function getRecommendations(
  categories: CategoryId[],
  page = 1,
): Promise<RecommendationResponse> {
  const safeCategories = categories.filter((category) => CATEGORY_CONFIG[category]).slice(0, 2);
  const selectedCategories = safeCategories.length ? safeCategories : (["drama", "comedy"] as CategoryId[]);

  if (!getCredentials().token && !getCredentials().apiKey) {
    const matching = demoTitles
      .filter((title) => selectedCategories.includes(title.category))
      .map((title) => ({ ...title, providers: [demoProvider] }));
    const extras = demoTitles
      .filter((title) => !selectedCategories.includes(title.category))
      .slice(0, 4)
      .map((title) => ({ ...title, providers: [demoProvider] }));
    return {
      recommendations: [...matching, ...extras].slice(0, 8),
      source: "demo",
      generatedAt: new Date().toISOString(),
    };
  }

  try {
    const batches = await Promise.all(
      selectedCategories.flatMap((category) => [
        discover("movie", category, page),
        discover("tv", category, page),
      ]),
    );
    const unique = new Map<string, (typeof batches)[number][number]>();
    batches.flat().forEach((entry) => unique.set(`${entry.mediaType}-${entry.item.id}`, entry));
    const queue = [...unique.values()]
      .sort((left, right) => deterministicOrder(left.item.id, page) - deterministicOrder(right.item.id, page))
      .slice(0, 10);

    const recommendations = await Promise.all(
      queue.map(async ({ item, mediaType, category }) => {
        const watch = await providersFor(mediaType, item.id);
        const date = item.release_date ?? item.first_air_date ?? "";
        return {
          id: item.id,
          mediaType,
          title: item.title ?? item.name ?? "Título sem nome",
          year: date.slice(0, 4),
          overview: item.overview || "Sinopse ainda não disponível em português.",
          posterUrl: item.poster_path ? `${TMDB_IMAGE_URL}/w780${item.poster_path}` : undefined,
          backdropUrl: item.backdrop_path ? `${TMDB_IMAGE_URL}/w1280${item.backdrop_path}` : undefined,
          rating: Number((item.vote_average ?? 0).toFixed(1)),
          providers: watch.providers,
          tmdbUrl: `https://www.themoviedb.org/${mediaType}/${item.id}`,
          category,
        } satisfies Recommendation;
      }),
    );

    const available = recommendations.filter((item) => item.providers.length > 0).slice(0, 8);
    if (!available.length) throw new Error("TMDB returned no titles from the preferred providers");

    return {
      recommendations: available,
      source: "tmdb",
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("TMDB recommendation fallback", error);
    const fallback = demoTitles
      .filter((title) => selectedCategories.includes(title.category))
      .map((title) => ({ ...title, providers: [demoProvider] }));
    return {
      recommendations: fallback,
      source: "demo",
      generatedAt: new Date().toISOString(),
    };
  }
}
