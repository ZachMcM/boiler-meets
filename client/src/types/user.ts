export type User = {
  id: string
  username: string
  image: string | null
  name: string,
  major: string | null
  year: string | null
  profile: any | null
}

export type Match = {
  matchId: number;
  matchedUserId: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    name: string;
    image: string | null;
    major: string | null;
    year: string | null;
    bio: string | null;
  };
};