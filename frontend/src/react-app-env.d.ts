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
  members?: string[];
}

interface IUser {
  username?: string;
  bio?: string;
  avatarUrl?: string | null;
  triviaScore?: number | null;
}

interface GroupFilter {
  title?: string;
  startTimeAfter?: string;
  startTimeBefore?: string;
  maxSize?: number;
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
}
