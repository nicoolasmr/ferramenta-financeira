"use client";

import { useEffect, useState } from "react";
import { Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/data-table/DataTable";
import { EmptyState } from "@/components/states/EmptyState";
import { LoadingState } from "@/components/states/LoadingState";
import { CreateDialog } from "@/components/dialogs/CreateDialog";
import { EditDialog } from "@/components/dialogs/EditDialog";
import { DeleteDialog } from "@/components/dialogs/DeleteDialog";
import { getProjects, createProject, updateProject, deleteProject, type Project } from "@/actions/projects";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { useOrganization } from "@/components/providers/OrganizationProvider";
import { ErrorState } from "@/components/states/ErrorState";

const columns: ColumnDef<Project>[] = [
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
            <Link
                href={`/app/projects/${row.original.id}`}
                className="font-medium text-blue-600 hover:underline"
            >
                {row.original.name}
            </Link>
        ),
    },
    {
        accessorKey: "description",
        header: "Description",
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
            <span className={`px-2 py-1 rounded text-xs font-medium ${row.original.status === 'active'
                ? 'bg-green-100 text-green-700'
                : 'bg-slate-100 text-slate-700'
                }`}>
                {row.original.status}
            </span>
        ),
    },
    {
        accessorKey: "created_at",
        header: "Created",
        cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
    },
    {
        id: "actions",
        cell: ({ row }) => <ProjectActions project={row.original} />,
    },
];

function ProjectActions({ project }: { project: Project }) {
    const [showEdit, setShowEdit] = useState(false);
    const [showDelete, setShowDelete] = useState(false);

    const handleUpdate = async (data: Record<string, string>) => {
        try {
            await updateProject(project.id, data);
            toast.success("Project updated successfully!");
            window.location.reload();
        } catch (error) {
            toast.error("Failed to update project");
        }
    };

    const handleDelete = async () => {
        try {
            await deleteProject(project.id);
            toast.success("Project deleted successfully!");
            window.location.reload();
        } catch (error) {
            toast.error("Failed to delete project");
        }
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setShowEdit(true)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowDelete(true)} className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {showEdit && (
                <EditDialog
                    title="Edit Project"
                    description="Update project information"
                    fields={[
                        { name: "name", label: "Project Name", type: "text" },
                        { name: "description", label: "Description", type: "textarea" },
                    ]}
                    initialData={{ name: project.name, description: project.description || "" }}
                    onSubmit={handleUpdate}
                    trigger={<div />}
                />
            )}

            {showDelete && (
                <DeleteDialog
                    title="Delete Project"
                    description="Are you sure you want to delete this project?"
                    itemName={project.name}
                    onConfirm={handleDelete}
                    trigger={<div />}
                />
            )}
        </>
    );
}

export default function ProjectsPage() {
    const { activeOrganization, loading: orgLoading } = useOrganization();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (orgLoading) return;

        if (!activeOrganization) {
            setLoading(false);
            return;
        }

        getProjects(activeOrganization.id)
            .then(setProjects)
            .catch(() => toast.error("Failed to load projects"))
            .finally(() => setLoading(false));
    }, [activeOrganization, orgLoading]);

    const handleCreate = async (data: Record<string, string>) => {
        if (!activeOrganization) return;

        try {
            await createProject({
                name: data.name,
                description: data.description,
                environment: 'production',
                region: 'gru1',
                org_id: activeOrganization.id,
            });
            toast.success("Project created successfully!");
            window.location.reload();
        } catch (error) {
            toast.error("Failed to create project");
        }
    };

    if (orgLoading || (loading && projects.length === 0)) return <LoadingState />;
    if (!activeOrganization) return <ErrorState message="Nenhuma organização encontrada. Por favor, crie uma organização primeiro." />;

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
                    <p className="text-slate-500">Manage your projects and configurations</p>
                </div>
                <CreateDialog
                    title="Create Project"
                    description="Add a new project to your organization"
                    fields={[
                        { name: "name", label: "Project Name", type: "text", required: true },
                        { name: "description", label: "Description", type: "textarea" },
                    ]}
                    onSubmit={handleCreate}
                    triggerLabel="Add Project"
                />
            </div>

            {projects.length === 0 ? (
                <EmptyState
                    title="No projects yet"
                    description="Start by creating your first project"
                    action={
                        <CreateDialog
                            title="Create Project"
                            description="Add a new project to your organization"
                            fields={[
                                { name: "name", label: "Project Name", type: "text", required: true },
                                { name: "description", label: "Description", type: "textarea" },
                            ]}
                            onSubmit={handleCreate}
                            triggerLabel="Add Project"
                        />
                    }
                />
            ) : (
                <DataTable
                    columns={columns}
                    data={projects}
                    searchKey="name"
                    searchPlaceholder="Search projects..."
                />
            )}
        </div>
    );
}
