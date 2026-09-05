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
        <TabsTrigger value="canvas">02 / Your world</TabsTrigger>
        <TabsTrigger value="layouts">03 / World rules</TabsTrigger>
        <TabsTrigger value="input">04 / Direct input</TabsTrigger>
      </TabsList>
      <TabsContent value="workspace">
        <Workspace />
      </TabsContent>
      <TabsContent value="canvas">
        <InfiniteCanvas />
      </TabsContent>
      <TabsContent value="layouts">
        <WorldLayouts />
      </TabsContent>
      <TabsContent value="input">
        <DirectInput />
      </TabsContent>
    </Tabs>
  );
}
