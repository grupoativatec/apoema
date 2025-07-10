// Id pode ser string (ex: UUID, timestamp) ou number (ex: auto increment)
export type Id = string | number;

export type Column = {
  id: Id;
  title: string;
  kanbanId: Id;
};

export type Task = {
  id: Id;
  columnId: Id;
  content: string;
  assignedTo?: string;
  tags?: string;
  startDate?: string;
  endDate?: string;
};

export type APIStatus = 'online' | 'offline' | 'unstable';

export interface APIService {
  name: string;
  url: string;
  category: string;
  status: APIStatus;
}

export interface API {
  id: number;
  name: string;
  url: string;
  realUrl: string;
  categoria: string;
  descricao: string;
  authorization?: string;
  online: boolean;
  responseTime: number | null;
}
