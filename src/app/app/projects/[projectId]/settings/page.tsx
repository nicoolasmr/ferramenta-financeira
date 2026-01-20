"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useParams } from "next/navigation";

export default function ProjectSettingsPage() {
    const params = useParams();
    const projectId = params.projectId as string;

    return (
        <div className="flex flex-col gap-6 max-w-4xl">
            <div>
                <h2 className="text-xl font-bold tracking-tight">Project Settings</h2>
                <p className="text-muted-foreground">Manage your project configuration.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>General</CardTitle>
                    <CardDescription>Update project information.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="name">Project Name</Label>
                        <Input id="name" placeholder="Project Name" defaultValue="Mentoria Q1 2026" />
                    </div>
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="client">Client / Company Name</Label>
                        <Input id="client" placeholder="Client Name" defaultValue="Acme Corp" />
                    </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                    <Button>Save Changes</Button>
                </CardFooter>
            </Card>

            <Card className="border-red-200">
                <CardHeader>
                    <CardTitle className="text-red-600">Danger Zone</CardTitle>
                    <CardDescription>Irreversible actions.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium">Archive Project</div>
                            <div className="text-sm text-muted-foreground">Hide this project from your list but keep data.</div>
                        </div>
                        <Button variant="outline" className="text-orange-600 border-orange-200 hover:bg-orange-50">Archive</Button>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium">Delete Project</div>
                            <div className="text-sm text-muted-foreground">Permanently delete this project and all data.</div>
                        </div>
                        <Button variant="destructive">Delete Project</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
