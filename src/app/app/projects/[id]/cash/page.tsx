"use client";

import { CashPortfolioPage } from "../../../cash/cash-portfolio";

export default async function ProjectCashPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <CashPortfolioPage />;
}
