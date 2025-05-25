export enum Status {
  Loading = "loading",
  FinishedSuccessfully = "finished_successfully",
  FinishedError = "finished_with_error",
}

export enum SubmitKey {
  Enter = "Enter",
  CtrlEnter = "Ctrl + Enter",
  ShiftEnter = "Shift + Enter",
  AltEnter = "Alt + Enter",
  MetaEnter = "Meta + Enter",
}


export interface MessageData {
  id: string;
  threadId?: string;
  searchId?: string;
  text: string;
  role: "user" | "model";
  createdAt?: string;
}

export interface ThreadData {
  id: string;
  title: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SectionData {
  md_hash: string;
  title: string;
  text: string;
  created_at: string;
  url: string;
}
