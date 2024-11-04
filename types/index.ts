export interface Event {
  event: string;
  data: any;
}

export interface SearchResult {
  conversations: [string, ConversationTurn[]][];
  url_to_info: {
    [url: string]: UrlInfo;
  };
}

export interface ConversationTurn {
  agent_utterance: string;
  user_utterance: string;
  search_queries: string[];
  search_results: SearchResultItem[];
}

export interface SearchResultItem {
  uuid: string;
  meta: {};
  description: string;
  snippets: string[];
  title: string;
  url: string;
}

export interface UrlInfo {
  uuid: string;
  meta: {};
  description: string;
  snippets: string[];
  title: string;
  url: string;
}

export interface UrlToInfo {
  description: string;
  snippets: string[];
  title: string;
  url: string;
}

export interface Session {
  id: string;
  title: string;
  taskId: string;
  summary: string;
  createdAt: number;
  updatedAt: number;
  query: string;
  outline: string;
  article: string;
  urlToInfo: UrlToInfo[];
  searchResults: SearchResult;
  middleInfo: string;
}

export interface SessionStore {
  sessions: Session[];
  currentSession: Session | null;
}
