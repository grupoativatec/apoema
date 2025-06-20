'use client';

import dynamic from 'next/dynamic';
import * as React from 'react';

const KanbanBoard = dynamic(() => import('@/components/KanbanBoard'), {
  ssr: false,
});

interface Props {
  params: Promise<{ id: string }>;
}

export default function KanbanPage({ params }: Props) {
  const { id } = React.use(params); 

  return (
    <div className="w-full h-full">
      <KanbanBoard kanbanId={id} />
    </div>
  );
}
