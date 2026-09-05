'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Workspace } from '@/components/workspace';
import { InfiniteCanvas } from '@/components/infinite-canvas';

export function Demos() {
  return (
    <Tabs defaultValue="canvas" className="demo-tabs">
      <TabsList aria-label="Ataxia examples" className="demo-tab-list">
        <TabsTrigger value="workspace">01 / Agent + windows</TabsTrigger>
        <TabsTrigger value="canvas">02 / Your world</TabsTrigger>
      </TabsList>
      <TabsContent value="workspace">
        <Workspace />
      </TabsContent>
      <TabsContent value="canvas">
        <InfiniteCanvas />
      </TabsContent>
    </Tabs>
  );
}
