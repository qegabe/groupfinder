/// <reference types="react-scripts" />

interface Group {
  id: number;
  title: string;
  description: string;
  startTime: import("dayjs").Dayjs;
  endTime: import("dayjs").Dayjs;
  location: string;
  isPrivate: boolean;
  maxMembers: number;
  members: object;
  games: Game[];
}

type ListGroup = Omit<
  Group,
  "description" | "location" | "isPrivate" | "maxMembers" | "members" | "games"
>;

interface IUser {
  username?: string;
  bio?: string;
  avatarUrl?: string | null;
  triviaScore?: number | null;
}

interface Game {
  id: number;
  title: string;
  coverUrl: string;
}

interface GroupFilter {
  title?: string;
  startTimeAfter?: string;
  startTimeBefore?: string;
  maxSize?: number;
}

interface GroupFormData {
  title: string;
  description: string;
  startTime: Dayjs | null;
  endTime: Dayjs | null;
  isPrivate: boolean;
  maxMembers: number | undefined;
}

interface GroupFormProps {
  initialState: GroupFormData;
  formData: GroupFormData;
  setFormData: (value: any) => void;
  submit: () => Promise<void>;
  returnPath: string;
  shouldReturn: boolean;
  buttons: { submit: string; cancel: string };
}

interface GroupListProps {
  groupsData: IGroup[];
}

interface GroupCardProps {
  id: number;
  title: string;
  startTime: import("dayjs").Dayjs;
}

interface GroupFilterProps {
  formData: any;
  setFormData: (value: any) => void;
}

interface SearchBarProps {
  submitSearch: (term: string) => void;
  label?: string;
}

interface AddGameProps {
  addGame: (game: Game) => void;
}

interface GameListProps {
  removeGame?: (game: Game) => Promise<void>;
  gameData: Game[];
}

interface GameCardProps extends Game {
  removeGame?: (game: Game) => Promise<void>;
}
