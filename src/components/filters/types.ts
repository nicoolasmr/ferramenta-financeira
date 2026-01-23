export interface FilterState {
    search?: string;
    dateRange?: {
        from: Date;
        to: Date;
        preset?: 'today' | 'last7days' | 'last30days' | 'thisMonth' | 'lastMonth' | 'custom';
    };
    status?: string[];
    tags?: string[];
    paymentMethod?: string[];
    provider?: string[];
    source?: string[];
    amountRange?: {
        min?: number;
        max?: number;
    };
    customFilters?: Record<string, any>;
}

export interface FilterConfig {
    search?: {
        placeholder: string;
        fields: string[]; // Database fields to search
    };
    dateRange?: {
        label: string;
        field: string; // Database field
    };
    multiSelect?: Array<{
        key: string;
        label: string;
        placeholder: string;
        options: Array<{ value: string; label: string }>;
        field: string; // Database field
    }>;
    numericRange?: {
        label: string;
        field: string;
        min?: number;
        max?: number;
        step?: number;
    };
}

export interface FilterPreset {
    id: string;
    name: string;
    page: string; // 'customers' | 'transactions' | 'sales' | 'aging'
    filters: FilterState;
    is_default: boolean;
    org_id: string;
    user_id: string;
    created_at: string;
    updated_at: string;
}
