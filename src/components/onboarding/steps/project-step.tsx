import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface StepProjectProps {
    data: { projectName: string };
    onChange: (e: any) => void;
}

export function StepProject({ data, onChange }: StepProjectProps) {
    return (
        <div className="space-y-6">
            <div className="space-y-2 text-center mb-6">
                <h2 className="text-2xl font-bold">Create your First Project</h2>
                <p className="text-slate-500">Projects organize your products, launches, and campaigns.</p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="projectName">Project Name</Label>
                    <Input
                        id="projectName"
                        name="projectName"
                        placeholder="e.g. Q1 Product Launch"
                        value={data.projectName}
                        onChange={onChange}
                        autoFocus
                        required
                    />
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm text-slate-600">
                    <p>
                        This project will be automatically created and pinned to your dashboard. You can add more projects later.
                    </p>
                </div>
            </div>
        </div>
    );
}
