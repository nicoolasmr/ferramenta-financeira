
import { NextRequest, NextResponse } from "next/server";

export function requireInternalAuth(req: NextRequest, envKeyName = "INTERNAL_API_SECRET") {
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
        return NextResponse.json({ error: "Missing Authorization header" }, { status: 401 });
    }

    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
        return NextResponse.json({ error: "Invalid Authorization format. Expected: Bearer <token>" }, { status: 401 });
    }

    const secret = process.env[envKeyName];

    if (!secret) {
        console.error(`[Security] Env var ${envKeyName} is not set.`);
        return NextResponse.json({ error: "Configuration error" }, { status: 500 });
    }

    // Use timing-safe comparison in production ideally, but for MVP check equality
    // In C5 we will upgrade this to crypto.timingSafeEqual
    if (token !== secret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return null; // Auth success
}
