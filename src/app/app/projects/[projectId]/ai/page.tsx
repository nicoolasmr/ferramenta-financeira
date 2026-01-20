import ProjectAIChatInterface from "./chat-interface";

export default function ProjectAIPage({ params }: { params: Promise<{ projectId: string }> }) {
    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col gap-4 p-4">
            <div className="flex-none">
                <h1 className="text-3xl font-bold tracking-tight">AI Project Analyst</h1>
                <p className="text-muted-foreground">Ask questions about your project's performance, financials, or strategy.</p>
            </div>

            <ProjectAIChatInterface />
        </div>
    )
}
