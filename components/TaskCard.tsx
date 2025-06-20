import { Id, Task } from '@/types/types';
import { useSortable } from '@dnd-kit/sortable';
import { TrashIcon } from '@heroicons/react/24/solid';
import React, { useEffect, useRef, useState } from 'react';
import { CSS } from '@dnd-kit/utilities';
import { format, parseISO } from 'date-fns';

import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from './ui/command';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from './ui/calendar';
import TextareaAutosize from 'react-textarea-autosize';
import { Button } from './ui/button';

interface Props {
  task: Task;
  deleteTask: (id: Id) => void;
  updateTask: (id: Id, content: string, updates?: Partial<Task>) => void;
  users: { id: number; name: string; email: string; avatarUrl: string }[];
}

function TaskCard({ task, deleteTask, updateTask, users }: Props) {
  const [mouseIsOver, setMouseIsOver] = useState(false);
  const [content, setContent] = useState(task.content);
  const [isEditing, setIsEditing] = useState(false);

  const updateTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const USERS = users;

  const TAGS = ['ETIQUETA', 'ANALISE'];

  // Hook do dnd-kit para tornar esta task arrastável
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: 'Task', task },
    disabled: isEditing,
  });

  // Aplica transformações visuais durante o drag
  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  // Debounce: espera 500ms após última edição antes de atualizar no backend
  useEffect(() => {
    if (content !== task.content) {
      if (updateTimeout.current) clearTimeout(updateTimeout.current);
      updateTimeout.current = setTimeout(() => {
      updateTask(task.id, content, { content });
      }, 500);
    }
  }, [content]);



  // Componente visual durante o arrasto (sombras, opacidade, etc.)
  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="relative mb-1 overflow-y-hidden bg-white/80 dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 text-zinc-800 dark:text-zinc-200 rounded-md p-2 flex flex-col gap-1 shadow-sm cursor-grab opacity-60"
      >
        {/* Conteúdo da task */}
        <p className="w-full text-zinc-800 dark:text-white text-sm leading-tight whitespace-pre-wrap break-words">
          {task.content}
        </p>

        <div className="mt-2 flex items-center justify-start gap-2 text-xs">
          {/* Avatar */}
          <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800">
            <img
              src={
                USERS.find((u) => u.name === task.assignedTo)?.avatarUrl ??
                'https://hwchamber.co.uk/wp-content/uploads/2022/04/avatar-placeholder.gif'
              }
              alt="avatar"
              className="w-5 h-5 rounded-full"
            />
          </div>

          {/* Datas */}
          <div className="flex items-center gap-1  dark:text-yellow-300">
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-full">
              <CalendarIcon className="w-3 h-3" />
              <span>{task.startDate ? format(parseISO(task.startDate), 'dd/MM') : 'Início'}</span>
            </div>
            <span>-</span>
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-full">
              <CalendarIcon className="w-3 h-3" />
              <span>{task.endDate ? format(parseISO(task.endDate), 'dd/MM') : 'Fim'}</span>
            </div>
          </div>
        </div>

        {/* Tags */}
        {task.tags && (
          <div className="mt-1">
            <span className="px-2 text-[11px] rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
              #{task.tags}
            </span>
          </div>
        )}
      </div>
    );
  }


  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative mb-1 overflow-y-hidden bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 text-zinc-800 dark:text-zinc-200 rounded-md p-3 flex flex-col gap-1 shadow-sm hover:ring-1 hover:ring-blue-400 transition-all cursor-grab"
      onMouseEnter={() => setMouseIsOver(true)}
      onMouseLeave={() => setMouseIsOver(false)}
    >
      {/* Conteúdo da task (textarea) */}
      <TextareaAutosize
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onFocus={() => setIsEditing(true)}
        onBlur={() => {
          setIsEditing(false);
          updateTask(task.id, content, { content });
        }}
        onClick={(e) => e.stopPropagation()}
        className="w-full bg-transparent text-zinc-800 dark:text-white text-sm leading-tight focus:outline-none focus:ring-0 resize-none"
      />

      <div className="mt-2 flex items-center justify-start gap-2 text-xs">
        {/* Avatar */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition"
            >
              <img
                src={
                  USERS.find((u) => u.name === task.assignedTo)?.avatarUrl ??
                  'https://hwchamber.co.uk/wp-content/uploads/2022/04/avatar-placeholder.gif'
                }
                alt="avatar"
                className="w-5 h-5 rounded-full"
              />
            </button>
          </PopoverTrigger>
          <PopoverContent
            onClick={(e) => e.stopPropagation()}
            className="w-48 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-600 text-zinc-800 dark:text-white"
          >
            <Command>
              <CommandEmpty>Nenhum usuário encontrado.</CommandEmpty>
              <CommandGroup>
                {USERS.map((user) => (
                  <CommandItem
                    key={user.name}
                    onSelect={() => updateTask(task.id, content, { assignedTo: user.name })}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <img src={user.avatarUrl} alt={user.name} className="w-4 h-4 rounded-full" />
                    <span>{user.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Datas */}
        <div className="flex items-center gap-1 dark:text-yellow-300">
          <Popover>
            <PopoverTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 px-1.5 py-0.5 rounded-full"
              >
                <CalendarIcon className="w-3 h-3" />
                {task.startDate ? format(parseISO(task.startDate), 'dd/MM') : 'Início'}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-600 text-zinc-800 dark:text-white">
              <Calendar
                mode="single"
                selected={task.startDate ? parseISO(task.startDate) : undefined}
                onSelect={(date) => {
                  if (!date) return;
                  updateTask(task.id, content, {
                    startDate: date.toISOString(),
                  });
                }}
              />
            </PopoverContent>
          </Popover>

          <span>-</span>

          <Popover>
            <PopoverTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 px-1.5 py-0.5 rounded-full"
              >
                <CalendarIcon className="w-3 h-3" />
                {task.endDate ? format(parseISO(task.endDate), 'dd/MM') : 'Fim'}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-600 text-zinc-800 dark:text-white">
              <Calendar
                mode="single"
                selected={task.endDate ? parseISO(task.endDate) : undefined}
                onSelect={(date) => {
                  if (!date) return;
                  updateTask(task.id, content, {
                    endDate: date.toISOString(),
                  });
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Tags personalizadas */}
      <div onClick={(e) => e.stopPropagation()} className="mt-1">
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={`px-2 text-[11px] rounded-full transition py-0.5 ${
                task.tags
                  ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800'
                  : 'text-blue-600 bg-zinc-100 hover:bg-zinc-200 dark:text-blue-400 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-300 dark:border-zinc-600'
              }`}
            >
              {task.tags ? `#${task.tags}` : '+ Tag'}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-56 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-600 text-zinc-800 dark:text-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const newTag = String(formData.get('newTag') || '').trim();
                updateTask(task.id, content, { tags: newTag || undefined });
              }}
              className="space-y-2"
            >
              <label htmlFor="newTag" className="text-xs text-zinc-500 dark:text-zinc-400 block">
                {task.tags ? 'Editar tag' : 'Nova tag'}
              </label>
              <input
                name="newTag"
                defaultValue={task.tags ?? ''}
                className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 text-sm px-2 py-1 rounded outline-none focus:ring-1 focus:ring-blue-400"
                placeholder="Digite uma tag..."
              />

              <div className="flex justify-between gap-2">
                {task.tags && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => updateTask(task.id, content, { tags: undefined })}
                    className="w-full"
                  >
                    Remover
                  </Button>
                )}
                <Button type="submit" className="w-full bg-sky-500 text-white hover:bg-sky-400">
                  Criar
                </Button>
              </div>
            </form>
          </PopoverContent>
        </Popover>
      </div>

      {/* Botão de deletar */}
      {mouseIsOver && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteTask(task.id);
          }}
          className="absolute right-2 top-2 opacity-60 hover:opacity-100 p-1 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-red-100 dark:hover:bg-red-600"
        >
          <TrashIcon className="w-4 h-4 text-zinc-800 dark:text-white" />
        </button>
      )}
  </div>

  );
}

export default TaskCard;
