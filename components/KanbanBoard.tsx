'use client';

import { PlusIcon } from '@heroicons/react/24/solid';
import { Button } from './ui/button';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Column, Id, Task } from '@/types/types';
import { v4 as uuidv4 } from 'uuid';


import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, SortableContext } from '@dnd-kit/sortable';
import { createPortal } from 'react-dom';
import {
  createColumn,
  deleteColumnDB,
  getColumnsByKanban,
  updateColumnTitle,
} from '@/lib/actions/columns.actions';
import {
  createTask,
  deleteTaskDB,
  getTasksByKanban,
  updateTaskDB,
} from '@/lib/actions/tasks.actions';
import { getAllUsers } from '@/lib/actions/user.actions';
import ColumnContainer from './ColumnContainer';
import TaskCard from './TaskCard';
import { pusherClient } from '@/lib/pusher-client';
import { pusherServer } from '@/lib/pusher-server';
import { triggerPusherServer } from '@/lib/actions/pusher.actions';

interface KanbanBoardProps {
  kanbanId: string;
}

function KanbanBoard({ kanbanId }: KanbanBoardProps) {
  
  const [loading, setLoading] = useState(true);

  const [columns, setColumns] = useState<Column[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<
    { id: number; name: string; email: string; avatarUrl: string }[]
  >([]);

  const hasAttemptedInitialColumn = useRef(false);

  const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 3 },
    }),
  );

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const fetchedUsers = await getAllUsers();
        setUsers(fetchedUsers);
      } catch (err) {
        console.error('Erro ao buscar usuários:', err);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cols, tasks] = await Promise.all([
          getColumnsByKanban(kanbanId),
          getTasksByKanban(kanbanId),
        ]);

        const cookie = document.cookie
          .split('; ')
          .find((row) => row.startsWith(`kanban-${kanbanId}-columnOrder=`));

        let orderedCols = cols;
        if (cookie) {
          const cookieValue = cookie.split('=')[1];
          const savedOrder = JSON.parse(cookieValue);

          orderedCols = savedOrder
            .map((id: string) => cols.find((col: { id: any }) => String(col.id) === id))
            .filter(Boolean) as Column[];

          const remainingCols = cols.filter(
            (col: { id: any }) => !savedOrder.includes(String(col.id)),
          );
          orderedCols = [...orderedCols, ...remainingCols];
        }

        setColumns(orderedCols);
        setTasks(tasks);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [kanbanId]);

  useEffect(() => {

    pusherClient.subscribe('kanban-channel');

    const handleColumnCreated = (column: Column) => {
      setColumns((prev) => {
        const exists = prev.some((col) => col.id === column.id);
        return exists ? prev : [...prev, column];
      });
  };


  const handleColumnUpdated = (updated: Column) => {
    setColumns((prev) =>
      prev.map((col) => (col.id === updated.id ? { ...col, ...updated } : col)),
    );
  };

  const handleColumnDeleted = (id: Id) => {
    setColumns((prev) => prev.filter((col) => col.id !== id));
    setTasks((prev) => prev.filter((task) => task.columnId !== id));
  };

  const handleTaskCreated = (task: Task) => {
    setTasks((prev) => {
      const exists = prev.some((t) => t.id === task.id);
      return exists ? prev : [...prev, task];
    });
  };


  const handleTaskUpdated = (updated: Task) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === updated.id ? { ...task, ...updated } : task)),
    );
  };

  const handleTaskDeleted = (id: Id) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  pusherClient.bind('columnCreated', handleColumnCreated);
  pusherClient.bind('columnUpdated', handleColumnUpdated);
  pusherClient.bind('columnDeleted', handleColumnDeleted);
  pusherClient.bind('taskCreated', handleTaskCreated);
  pusherClient.bind('taskUpdated', handleTaskUpdated);
  pusherClient.bind('taskDeleted', handleTaskDeleted);

  return () => {
    pusherClient.unbind('columnCreated', handleColumnCreated);
    pusherClient.unbind('columnUpdated', handleColumnUpdated);
    pusherClient.unbind('columnDeleted', handleColumnDeleted);
    pusherClient.unbind('taskCreated', handleTaskCreated);
    pusherClient.unbind('taskUpdated', handleTaskUpdated);
    pusherClient.unbind('taskDeleted', handleTaskDeleted);
    pusherClient.unsubscribe('kanban-channel');
  };
}, []);


  return (
    <div className="w-full h-screen overflow-x-auto overflow-y-hidden dark:bg-zinc-900 custom-scrollbar">
      <DndContext
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
        sensors={sensors}
      >
        <div className="flex justify-center gap-4 w-full min-w-max px-10 py-8 items-center h-full">
          <SortableContext items={columnsId}>
            {loading ? (
              // Skeleton UI enquanto carrega
            <div className="flex gap-4 animate-pulse">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div
                  key={idx}
                  className="flex flex-col w-[350px] h-[750px] rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 shadow-sm"
                >
                  <div className="px-4 py-3 bg-zinc-100 dark:bg-zinc-700 rounded-t-md">
                    <div className="h-5 bg-zinc-200 dark:bg-zinc-600 rounded w-2/3"></div>
                  </div>
                  <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
                    <div className="h-6 bg-zinc-100 dark:bg-zinc-700 rounded w-full"></div>
                    <div className="h-6 bg-zinc-100 dark:bg-zinc-700 rounded w-5/6"></div>
                    <div className="h-6 bg-zinc-100 dark:bg-zinc-700 rounded w-4/5"></div>
                  </div>
                  <div className="px-4 py-2 bg-zinc-100 dark:bg-zinc-700 rounded-b-md">
                    <div className="h-8 bg-zinc-200 dark:bg-zinc-600 rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>

            ) : columns.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center w-full min-h-[70vh] space-y-6 text-gray-500 dark:text-gray-300">
                <div>
                  <p className="text-lg font-semibold">Nenhuma Coluna disponível</p>
                  <p className="text-sm text-zinc-400">Clique abaixo para criar uma nova coluna</p>
                </div>

                <Button onClick={CreateColumn}>
                  <PlusIcon className="w-5 h-5" />
                  <span className="text-sm font-medium">Adicionar Coluna</span>
                </Button>
              </div>
            ) : (
              columns.map((col) => (
                <ColumnContainer
                  key={col.id}
                  column={col}
                  tasks={tasks.filter((task) => String(task.columnId) === String(col.id))}
                  createTaks={createTaks}
                  deleteTask={deleteTask}
                  updateTask={updateTask}
                  deleteColumn={deleteColumn}
                  updateColumn={updateColumn}
                  users={users}
                />
              ))
            )}
          </SortableContext>
        </div>

        {createPortal(
          <DragOverlay>
            {activeColumn && (
              <ColumnContainer
                column={activeColumn}
                tasks={tasks.filter((task) => String(task.columnId) === String(activeColumn.id))}
                createTaks={createTaks}
                deleteTask={deleteTask}
                updateTask={updateTask}
                deleteColumn={deleteColumn}
                updateColumn={updateColumn}
                users={users}
              />
            )}
            {activeTask && (
              <TaskCard
                task={activeTask}
                users={users}
                deleteTask={deleteTask}
                updateTask={updateTask}
              />
            )}
          </DragOverlay>,
          document.body,
        )}
      </DndContext>

      <Button
        onClick={CreateColumn}
        className="fixed bottom-6 right-6  z-50 flex items-center justify-center gap-2 h-[50px] px-5 shadow-lg bg-transparent text-black dark:bg-transparent dark:text-white hover:bg-blue-400 transition rounded-md border border-zinc-200 dark:border-white/10 backdrop-blur-sm"
      >
        <PlusIcon className="w-5 h-5" />
        <span className="text-sm font-medium">Adicionar Coluna</span>
      </Button>

    </div>
  );

  async function CreateColumn() {
    const newColumn: Column = {
      id: uuidv4(),
      title: `Coluna ${columns.length + 1}`,
      kanbanId,
    };

    try {
      await createColumn({
        id: String(newColumn.id),
        title: newColumn.title,
        kanbanId: String(newColumn.kanbanId),
      });

      setColumns((prev) => [...prev, newColumn]);
      await triggerPusherServer('columnCreated', newColumn);
    } catch (err) {
      console.error('Erro ao criar coluna:', err);
    }
  }

  function formatDateToMariaDBDate(date?: string | Date): string | undefined {
    if (!date) return undefined;
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString().slice(0, 10);
  }

  async function createTaks(columnId: Id) {
    const newTask: Task = {
      id: uuidv4(),
      columnId,
      content: `Tarefa ${tasks.length + 1}`,
    };

    try {
      await createTask({
        id: String(newTask.id),
        columnId: String(columnId),
        content: newTask.content,
        assignedTo: newTask.assignedTo,
        tags: newTask.tags,
        startDate: formatDateToMariaDBDate(newTask.startDate),
        endDate: formatDateToMariaDBDate(newTask.endDate),
      });

      setTasks((prev) => [...prev, newTask]);
      await triggerPusherServer('taskCreated', newTask);
    } catch (err) {
      console.error('Erro ao criar tarefa:', err);
    }
  }

  async function updateTask(id: Id, content: string, updates?: Partial<Task>) {
  try {
    const normalizedUpdates = {
      content,
      assignedTo: updates?.assignedTo,
      tags: updates?.tags,
      startDate: formatDateToMariaDBDate(updates?.startDate),
      endDate: formatDateToMariaDBDate(updates?.endDate),
      columnId: updates?.columnId !== undefined ? String(updates.columnId) : undefined,
    };

    await updateTaskDB(String(id), normalizedUpdates);

    const prevTask = tasks.find((t) => t.id === id);
    if (!prevTask) return;

    const updatedTask: Task = {
      ...prevTask,
      ...updates,
      content,
    };

    setTasks((prev) => prev.map((t) => (t.id === id ? updatedTask : t)));

    // 🔥 garante que o evento chega em outras abas
    await triggerPusherServer('taskUpdated', updatedTask);
  } catch (err) {
    console.error('Erro ao atualizar tarefa:', err);
  }
  }


  async function deleteTask(id: Id) {
    try {
      await deleteTaskDB(String(id));
      setTasks((prev) => prev.filter((t) => t.id !== id));
      await triggerPusherServer('taskDeleted', id);
    } catch (err) {
      console.error('Erro ao deletar tarefa:', err);
    }
  }

  async function deleteColumn(id: Id) {
    try {
      await deleteColumnDB(String(id));
      setColumns((prev) => prev.filter((col) => col.id !== id));
      setTasks((prev) => prev.filter((task) => task.columnId !== id));
      await triggerPusherServer('columnDeleted', id);
    } catch (err) {
      console.error('Erro ao deletar coluna:', err);
    }
  }

  async function updateColumn(id: Id, title: string) {
    try {
      await updateColumnTitle(String(id), title);
      setColumns((prev) => prev.map((col) => (col.id === id ? { ...col, title } : col)));
      await triggerPusherServer('columnUpdated', { id, title });
    } catch (err) {
      console.error('Erro ao atualizar coluna:', err);
    }
  }

  function onDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === 'Column') {
      setActiveColumn(event.active.data.current.column);
    }

    if (event.active.data.current?.type === 'Task') {
      setActiveTask(event.active.data.current.task);
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveColumn(null);
    setActiveTask(null);

    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    // 👉 Se estiver arrastando uma tarefa
    if (activeData?.type === 'Task') {
      const activeId = active.id;
      const activeTask = activeData.task;

      let newColumnId;

      if (overData?.type === 'Task') {
        newColumnId = overData.task.columnId;
      } else if (overData?.type === 'Column') {
        newColumnId = over.id;
      }

      if (!newColumnId) return;

      setTasks((prevTasks) => {
        const activeIndex = prevTasks.findIndex((t) => t.id === activeId);
        const overIndex = prevTasks.findIndex((t) => t.id === over.id);

        // Atualiza a coluna da task arrastada
        const updatedTask = { ...activeTask, columnId: newColumnId };
        const newTasks = [...prevTasks];
        newTasks[activeIndex] = updatedTask;

        // Só reordena se for na mesma coluna E sobre uma outra task
        if (
          activeTask.columnId === newColumnId &&
          overData?.type === 'Task' &&
          activeIndex !== overIndex
        ) {
          return arrayMove(newTasks, activeIndex, overIndex);
        }

        return newTasks;
      });

      const updatedTask = { ...activeTask, columnId: newColumnId };

      updateTaskDB(String(activeId), {
        columnId: String(newColumnId),
      }).then(async () => {
        await triggerPusherServer('taskUpdated', updatedTask);
      });

      return;
    }

    // 👉 Se estiver arrastando uma coluna
    const activeColumnId = active.id;
    const overColumnId = over.id;

    if (activeColumnId === overColumnId) return;

    setColumns((columns) => {
      const activeIndex = columns.findIndex((col) => col.id === activeColumnId);
      const overIndex = columns.findIndex((col) => col.id === overColumnId);
      if (activeIndex === -1 || overIndex === -1) return columns;

      const newColumns = arrayMove(columns, activeIndex, overIndex);

      // Salva ordem no cookie
      document.cookie = `kanban-${kanbanId}-columnOrder=${JSON.stringify(
        newColumns.map((col) => col.id),
      )}; path=/; max-age=31536000`;

      return newColumns;
    });
  }

  function onDragOver(event: DragOverEvent) {}
}

export default KanbanBoard;
