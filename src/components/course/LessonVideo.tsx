import { videoEmbedUrl } from '@/lib/httpsUrl';

/** Lesson video, whatever the lesson type, when `video_url` is a safe https address. */
export function LessonVideo({ url, title }: { url: string | null; title: string }) {
  const src = videoEmbedUrl(url);
  if (!src) return null;
  return (
    <div className="mb-8 aspect-video overflow-hidden rounded-2xl border border-border/50 bg-secondary">
      <iframe
        src={src}
        title={`Vídeo da aula: ${title}`}
        loading="lazy"
        className="h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    </div>
  );
}
