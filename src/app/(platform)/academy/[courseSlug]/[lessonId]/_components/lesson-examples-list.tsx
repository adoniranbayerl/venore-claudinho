import { InteractiveNotation } from "@/components/interactive-notation";

export type LessonExampleStepItem = {
  id: string;
  title: string;
  captionText: string;
  audioUrl: string | null;
  sheetUrl: string | null;
  sheetFilename: string | null;
  notationData: string | null;
};

export function LessonExamplesList({ examples }: { examples: LessonExampleStepItem[] }) {
  return (
    <ul className="space-y-4">
      {examples.map((example) => (
        <li key={example.id} className="rounded-md border border-border px-3.5 py-3">
          <p className="text-sm font-medium text-foreground">{example.title}</p>
          <p className="mt-1 text-xs text-muted-foreground">{example.captionText}</p>
          <div className="mt-2 space-y-2">
            {example.notationData && (
              <InteractiveNotation abc={example.notationData} className="overflow-x-auto rounded-md bg-card p-2" />
            )}
            {example.audioUrl && <audio controls src={example.audioUrl} className="h-8 w-full" />}
            {example.sheetUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={example.sheetUrl}
                alt={example.sheetFilename ?? example.title}
                className="max-h-56 rounded-md border border-border"
              />
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
