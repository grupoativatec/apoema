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
