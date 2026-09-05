'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Workspace } from '@/components/workspace';
import { InfiniteCanvas } from '@/components/infinite-canvas';
import { WorldLayouts } from '@/components/world-layouts';
import { DirectInput } from '@/components/direct-input';

export function Demos() {
  return (
    <Tabs defaultValue="canvas" className="demo-tabs">
      <TabsList aria-label="Ataxia examples" className="demo-tab-list">
        <TabsTrigger value="workspace">01 / Agent + windows</TabsTrigger>
        <TabsTrigger value="input">02 / Direct Agentic Control</TabsTrigger>
        <TabsTrigger value="canvas">03 / Your world</TabsTrigger>
        <TabsTrigger value="layouts">04 / World rules</TabsTrigger>
      </TabsList>
      <TabsContent value="workspace">
        <Workspace />
      </TabsContent>
      <TabsContent value="input">
        <DirectInput />
      </TabsContent>
      <TabsContent value="canvas">
        <InfiniteCanvas />
      </TabsContent>
      <TabsContent value="layouts">
        <WorldLayouts />
      </TabsContent>
    </Tabs>
  );
}
