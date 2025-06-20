import { Column, Id, Task } from '@/types/types';
import React, { useMemo, useState, useEffect } from 'react';
import { Button } from './ui/button';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/solid';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TaskCard from './TaskCard';

interface Props {
  column: Column;
  deleteColumn: (id: Id) => void;
  updateColumn: (id: Id, title: string) => void;
  createTaks: (columnId: Id) => void;
  updateTask: (id: Id, content: string) => void;
  tasks: Task[];
  deleteTask: (id: Id) => void;
  users: { id: number; name: string; email: string; avatarUrl: string }[];
}

function ColumnContainer(props: Props) {
  const { column, deleteColumn, updateColumn, createTaks, tasks, deleteTask, updateTask, users } =
    props;

  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState(column.title);

  useEffect(() => {
    setEditTitle(column.title);
  }, [column.title]);

  const tasksIds = useMemo(() => {
    return tasks.map((task) => task.id);
  }, [tasks]);

  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: column.id,
    data: {
      type: 'Column',
      column,
    },
    disabled: editMode,
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="w-[350px] h-[750px] opacity-40 rounded-lg bg-zinc-700/80 border-2 border-dashed border-zinc-500 shadow-xl pointer-events-none flex flex-col"
      >
        <div className="bg-zinc-600 h-[60px] px-4 py-3 flex items-center justify-between border-b border-zinc-500">
          <div className="flex items-center gap-3 text-white font-semibold text-sm">
            <div className="bg-blue-500 text-white px-2 py-1 text-xs rounded-full font-bold">
              {column.title[0]}
            </div>
            <span className="truncate">{column.title}</span>
          </div>
        </div>

        <div className="flex-1 overflow-hidden p-4 space-y-2 text-zinc-300 text-sm">
          {[...Array(2)].map((_, idx) => (
            <div key={idx} className="bg-zinc-600 h-16 rounded-md animate-pulse opacity-80" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-zinc-800 w-[350px] h-[750px] rounded-lg shadow-md border border-zinc-700 flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div
        className="bg-zinc-700 h-[60px] px-4 py-3 flex items-center justify-between border-b border-zinc-600"
        {...attributes}
        {...listeners}
      >
        <div className="flex items-center gap-3 text-white font-semibold text-sm w-full">
        <div className="bg-blue text-white px-2 py-1 text-xs rounded-full font-bold">
          {tasks.length}
        </div>
          {!editMode ? (
            <span
              className="truncate w-full cursor-text"
              onClick={() => {
                setEditTitle(column.title); // garante valor atualizado
                setEditMode(true);
              }}
            >
              {column.title}
            </span>
          ) : (
            <input
              className="bg-zinc-600 text-white px-2 py-1 rounded-md border border-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              value={editTitle}
              autoFocus
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={() => {
                updateColumn(column.id, editTitle.trim() || column.title);
                setEditMode(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  updateColumn(column.id, editTitle.trim() || column.title);
                  setEditMode(false);
                }
              }}
            />
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-zinc-600 p-1"
          onClick={() => deleteColumn(column.id)}
        >
          <TrashIcon className="w-5 h-5 text-zinc-300 hover:text-red-400 transition-colors" />
        </Button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 text-zinc-300 text-sm gap-4 overflow-x-hidden">
        <SortableContext items={tasksIds}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              users={users}
              deleteTask={deleteTask}
              updateTask={updateTask}
            />
          ))}
        </SortableContext>
      </div>

      <button
        onClick={() => {
          createTaks(column.id);
        }}
        className="flex items-center justify-center gap-2 text-sm text-zinc-200 border border-zinc-600 rounded-md px-3 py-2 mx-4 my-3 hover:bg-zinc-700 hover:border-zinc-500 transition-colors"
      >
        <PlusIcon className="w-4 h-4" />
        Adicionar Tarefa
      </button>
    </div>
  );
}

export default ColumnContainer;
