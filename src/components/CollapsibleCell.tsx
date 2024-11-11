'use client';

import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import * as React from 'react';

interface CollapsibleCellProps {
  value?: string;
  maxLength?: number;
}

export default function CollapsibleCell({
  value = '',
  maxLength = 50,
}: CollapsibleCellProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const shouldCollapse = (value?.length ?? 0) > maxLength;

  if (!value || !shouldCollapse) {
    return <div>{value}</div>;
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="space-y-2">
        <CollapsibleContent className="text-sm">
          {isOpen ? value : `${value.slice(0, maxLength)}...`}
        </CollapsibleContent>
        <CollapsibleTrigger asChild>
          <Button variant="link" className="p-0 h-auto font-normal">
            {isOpen ? 'Show less' : 'Show more'}
          </Button>
        </CollapsibleTrigger>
      </div>
    </Collapsible>
  );
}
