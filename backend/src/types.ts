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
  members?: string[];
}

interface Filter {
  title?: string;
  startTimeAfter?: string;
  startTimeBefore?: string;
  maxSize?: number;
}

export { IUser, IGroup, Filter };
