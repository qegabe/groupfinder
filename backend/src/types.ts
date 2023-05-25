interface IUser {
  username: string;
  password: string;
  bio: string;
  avatarUrl: string | null;
  triviaScore: number | null;
}

interface UserMin {
  username: string;
  avatarUrl: string;
}

interface UserUpdate {
  username?: string;
  password?: string;
  bio?: string;
  avatarUrl?: string;
}

interface IGroup {
  id: number;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  location: string;
  users: string[];
}

interface GroupCreate {
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  location: string;
}

export { IUser, UserMin, UserUpdate, IGroup, GroupCreate };
