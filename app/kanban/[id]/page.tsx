'use client';

import dynamic from 'next/dynamic';

const KanbanBoard = dynamic(() => import('@/components/KanbanBoard'), {
  ssr: false,
});

interface Props {
  params: { id: string };
}

export default function KanbanPage({ params }: Props) {
  return (
    <div className="w-full h-full">
      <KanbanBoard kanbanId={params.id} />
    </div>
  );
}
