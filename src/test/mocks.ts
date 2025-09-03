import type { Show, ShowDetails } from '@/types/tmdb'

export const mockShow: Show = {
  id: 1399,
  name: "Game of Thrones",
  overview: "Seven noble families fight for control of the mythical land of Westeros.",
  poster_path: "/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg",
  backdrop_path: "/suopoADq0k8YZr4dQXcU6pToj6s.jpg",
  first_air_date: "2011-04-17",
  genre_ids: [10765, 18, 10759],
  origin_country: ["US"],
  original_language: "en",
  original_name: "Game of Thrones",
  popularity: 369.594,
  vote_average: 8.3,
  vote_count: 11504
}

export const mockShowDetails: ShowDetails = {
  ...mockShow,
  genres: [
    { id: 10765, name: "Sci-Fi & Fantasy" },
    { id: 18, name: "Drama" },
    { id: 10759, name: "Action & Adventure" }
  ],
  number_of_episodes: 73,
  number_of_seasons: 8,
  status: "Ended",
  tagline: "Winter Is Coming",
  homepage: "http://www.hbo.com/game-of-thrones",
  in_production: false,
  languages: ["en"],
  last_air_date: "2019-05-19",
  type: "Scripted",
  seasons: [
    {
      id: 3624,
      name: "Season 1",
      overview: "Trouble is brewing in the Seven Kingdoms of Westeros.",
      poster_path: "/zwaj4egrhnXOBIit1tyb4Sbt3KP.jpg",
      season_number: 1,
      air_date: "2011-04-17",
      episode_count: 10,
      vote_average: 0
    }
  ],
  networks: [
    {
      id: 49,
      name: "HBO",
      logo_path: "/tuomPhY2UuLikoJagTJBBNr3OqM.png",
      origin_country: "US"
    }
  ]
}

export const mockTrendingResponse = {
  page: 1,
  results: [mockShow],
  total_pages: 1000,
  total_results: 20000
}

export const mockSearchResponse = {
  page: 1,
  results: [mockShow],
  total_pages: 100,
  total_results: 2000
}

// Mock fetch responses
export const mockFetchResponses = {
  trending: () => Promise.resolve({
    ok: true,
    json: () => Promise.resolve(mockTrendingResponse)
  }),
  show: () => Promise.resolve({
    ok: true,
    json: () => Promise.resolve(mockShowDetails)
  }),
  search: () => Promise.resolve({
    ok: true,
    json: () => Promise.resolve(mockSearchResponse)
  }),
  error: () => Promise.resolve({
    ok: false,
    status: 500,
    statusText: 'Internal Server Error'
  })
}