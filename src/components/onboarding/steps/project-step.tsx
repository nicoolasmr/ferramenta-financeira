import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface StepProjectProps {
    data: { projectName: string };
    onChange: (e: any) => void;
}

export function StepProject({ data, onChange }: StepProjectProps) {
    return (
        <div className="space-y-6 pt-4">

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="projectName">Nome do Projeto</Label>
                    <Input
                        id="projectName"
                        name="projectName"
                        placeholder="Ex: Lançamento Q1"
                        value={data.projectName}
                        onChange={onChange}
                        autoFocus
                        required
                    />
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm text-slate-600">
                    <p>
                        Este projeto será criado automaticamente e fixado no seu dashboard. Você poderá criar outros projetos depois.
                    </p>
                </div>
            </div>
        </div>
    );
}
