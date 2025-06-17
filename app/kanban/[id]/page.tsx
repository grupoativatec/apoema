import KanbanBoard from '@/components/KanbanBoard';

interface Props {
  params: { id: string };
}

export default function KanbanPage({ params }: Props) {
  const { id } = params;

  return (
    <div className="w-full h-full">
      <KanbanBoard kanbanId={id} />
    </div>
  );
}
