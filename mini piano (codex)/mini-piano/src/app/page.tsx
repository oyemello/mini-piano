"use client";
import { TransportBar } from "@/components/transport/TransportBar";
import { Piano } from "@/components/piano/Piano";
import { InfoPanel } from "@/components/InfoPanel";
import { TrainerPanel } from "@/components/trainer/TrainerPanel";
import { RecorderPanel } from "@/components/recorder/RecorderPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KeyboardHandler } from "@/components/KeyboardHandler";
import { InstrumentControls } from "@/components/transport/InstrumentControls";
import { MidiHandler } from "@/components/MidiHandler";
import { AudioUnlockToast } from "@/components/AudioUnlockToast";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <KeyboardHandler />
      <MidiHandler />
      <TransportBar />
      <InstrumentControls />
      <AudioUnlockToast />
      <main className="flex-1 p-4 overflow-auto">
        <div className="max-w-screen-2xl mx-auto grid gap-4 md:grid-cols-2">
          <InfoPanel />
          <div>
            <Tabs defaultValue="trainer">
              <TabsList aria-label="Panels">
                <TabsTrigger value="trainer">Trainer</TabsTrigger>
                <TabsTrigger value="recorder">Recorder</TabsTrigger>
              </TabsList>
              <TabsContent value="trainer">
                <TrainerPanel />
              </TabsContent>
              <TabsContent value="recorder">
                <RecorderPanel />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <div className="border-t bg-background">
        <div className="max-w-screen-2xl mx-auto p-2">
          <Piano />
        </div>
      </div>
    </div>
  );
}
