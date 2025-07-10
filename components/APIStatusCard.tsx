'use client';
import { Card } from '@/components/ui/card';
import { APIService } from '@/types/types';
import { Circle } from 'lucide-react';

export function APIStatusCard({ name, url, status }: APIService) {
  const colorMap = {
    online: 'text-green',
    offline: 'text-red',
    unstable: 'text-yellow',
  };

  return (
    <Card className="p-4 flex flex-col justify-between h-32">
      <div className="flex items-center justify-between">
        <h2 className="text-md font-semibold">{name}</h2>
        <Circle className={`${colorMap[status]} w-4 h-4`} />
      </div>
      <p className="text-sm text-muted-foreground break-all">{url}</p>
    </Card>
  );
}
