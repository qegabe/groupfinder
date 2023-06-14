/// <reference types="react-scripts" />

interface IGroup {
  id: number;
  title: string;
  description?: string;
  startTime: import("dayjs").Dayjs;
  endTime: import("dayjs").Dayjs;
  location?: string;
  isPrivate?: boolean;
  maxMembers?: number;
  members?: object;
}

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

interface AlertProps {
  type: "success" | "danger";
  text: string;
}
