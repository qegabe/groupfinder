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
  location?: string;
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
}

export { IUser, IGroup, Filter, IGame };
