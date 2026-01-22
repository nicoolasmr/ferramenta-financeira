export interface TestResult {
    success: boolean;
    message: string;
    details?: Record<string, any>;
    error?: string;
}

export interface ConnectionTester {
    test(credentials: Record<string, string>): Promise<TestResult>;
}
