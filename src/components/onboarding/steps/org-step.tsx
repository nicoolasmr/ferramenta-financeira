import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface StepOrgProps {
    data: { orgName: string; orgSlug: string };
    onChange: (e: any) => void;
}

export function StepOrg({ data, onChange }: StepOrgProps) {
    return (
        <div className="space-y-6 pt-4">

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="orgName">Organization Name</Label>
                    <Input
                        id="orgName"
                        name="orgName"
                        placeholder="Acme Corp"
                        value={data.orgName}
                        onChange={onChange}
                        autoFocus
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="orgSlug">Workspace URL</Label>
                    <div className="flex items-center">
                        <span className="bg-slate-100 border border-r-0 rounded-l-md px-3 py-2 text-sm text-muted-foreground whitespace-nowrap">
                            app.revenueos.com/
                        </span>
                        <Input
                            id="orgSlug"
                            className="rounded-l-none"
                            name="orgSlug"
                            placeholder="acme"
                            value={data.orgSlug}
                            onChange={onChange}
                            required
                        />
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Lower case, numbers and hyphens only.
                    </p>
                </div>
            </div>
        </div>
    );
}
