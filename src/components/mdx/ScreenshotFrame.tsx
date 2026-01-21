export function ScreenshotFrame({ src, alt, caption }: { src?: string, alt?: string, caption?: string }) {
    return (
        <figure className="my-8">
            <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden shadow-sm">
                <div className="h-6 bg-slate-100 border-b border-slate-200 flex items-center px-4 gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                </div>
                {/* Fallback placeholder if no src */}
                <div className="aspect-video bg-white flex items-center justify-center p-8 text-center text-slate-400">
                    {src ? (
                        <img src={src} alt={alt || "Screenshot"} className="w-full h-auto" />
                    ) : (
                        <div>
                            <p className="font-mono text-xs uppercase tracking-wider mb-2">Screenshot Placeholder</p>
                            <p className="text-sm">{alt}</p>
                        </div>
                    )}
                </div>
            </div>
            {caption && <figcaption className="text-center text-xs text-slate-500 mt-2 italic">{caption}</figcaption>}
        </figure>
    );
}
