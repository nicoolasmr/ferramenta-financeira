export type NotificationType = "info" | "success" | "warning" | "error";

export interface Notification {
    id: string;
    org_id: string;
    user_id?: string;
    title: string;
    message: string;
    type: NotificationType;
    link?: string;
    read_at?: string;
    created_at: string;
}
