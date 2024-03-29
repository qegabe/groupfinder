interface IUser {
  username?: string;
  password?: string;
  bio?: string;
  avatarUrl?: string | null;
  triviaScore?: number | null;
}

interface IGroup {
  id?: number;
  title?: string;
  description?: string;
  startTime?: Date;
  endTime?: Date;
  address?: string;
  cityId?: number;
  city?: string;
  isPrivate?: boolean;
  maxMembers?: number;
  members?: object;
  games?: IGame[];
}

interface IGame {
  id?: number;
  title?: string;
  coverUrl?: string;
}

interface Filter {
  username?: string;
  title?: string;
  startTimeAfter?: string;
  startTimeBefore?: string;
  maxSize?: string;
  hasGames?: string[] | string;
  hasUsers?: string[] | string;
  city?: string;
}

export { IUser, IGroup, Filter, IGame };
