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

interface IGroupList {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
}

interface GroupFilter {
  title?: string;
  startTimeAfter?: string;
  startTimeBefore?: string;
  maxSize?: number;
}

interface GroupListProps {
  groupsData: IGroupList[];
}

interface GroupCardProps {
  id: number;
  title: string;
  startTime: string;
}

interface GroupFilterProps {
  formData: any;
  setFormData: (value: any) => void;
}

interface SearchBarProps {
  submitSearch: (term: string) => void;
}
