export type RatingLevel = 'G' | 'PG' | 'R' | 'Unhinged';

export interface RoastRequest {
  commitUrl: string;
  username: string;
  ratingLevel: RatingLevel;
  model?: string;
}

export interface RoastResponse {
  tweet: string;
  deepRoast: string;
  model: string;
  durationMs: number;
}