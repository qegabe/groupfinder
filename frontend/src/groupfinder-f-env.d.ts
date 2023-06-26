/// <reference types="react-scripts" />

interface Group {
  id: number;
  title: string;
  description: string;
  startTime: import("dayjs").Dayjs;
  endTime: import("dayjs").Dayjs;
  address: string;
  city: string;
  cityId: number;
  isPrivate: boolean;
  maxMembers: number;
  members: {
    [username: string]: {
      avatarUrl: string | null;
      isOwner: boolean;
    };
  };
  games: Game[];
}

type ListGroup = Omit<
  Group,
  | "description"
  | "location"
  | "isPrivate"
  | "maxMembers"
  | "members"
  | "games"
  | "address"
  | "city"
  | "cityId"
>;

interface User {
  username: string;
  bio?: string;
  avatarUrl: string | null;
  triviaScore?: number | null;
  isOwner?: boolean;
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
  hasGames?: number[];
}

interface GroupFormData {
  title: string;
  description: string;
  startTime: Dayjs | null;
  endTime: Dayjs | null;
  address: string;
  cityData: { city: string; id: number } | null;
  isPrivate: boolean;
  maxMembers: number;
}

interface GroupFormProps {
  initialState?: GroupFormData;
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

interface AddUserProps {
  addUser: (user: User) => void;
}

interface UserListProps {
  removeUser?: (user: User) => void;
  userData: {
    [username: string]: {
      avatarUrl: string | null;
      isOwner: boolean;
    };
  };
}

interface UserCardProps {
  removeUser?: (user: User) => void;
  username: string;
  avatarUrl: string | null;
  isOwner: boolean;
}

interface AddGameProps {
  addGame: (game: Game) => void;
}

interface GameListProps {
  removeGame?: (game: Game) => void;
  gameData: Game[];
}

interface GameCardProps extends Game {
  removeGame?: (game: Game) => void;
}

/************************************************************* Trivia */

interface Question {
  question: string;
  answers: string[];
  category: string;
}

interface TriviaQuestionProps {
  selectedAnswer?: number;
  question?: Question;
  correctAnswer?: string;
  sendAnswer: (idx: number) => void;
  nextQuestion: () => void;
}

interface TriviaScoresProps {
  users: Group["members"];
  scores: {
    [username: string]: number;
  };
}
