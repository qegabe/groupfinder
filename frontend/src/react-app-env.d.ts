/// <reference types="react-scripts" />

interface IGroup {
  id?: number;
  title?: string;
  description?: string;
  startTime?: import("dayjs").Dayjs;
  endTime?: import("dayjs").Dayjs;
  location?: string;
  isPrivate?: boolean;
  maxMembers?: number;
  members?: string[];
}

interface IUser {
  username?: string;
  bio?: string;
  avatarUrl?: string | null;
  triviaScore?: number | null;
}

interface GroupCardProps {
  id: number;
  title: string;
  startTime: string;
}

interface SearchBarProps {
  submitSearch: (term: string) => void;
}
