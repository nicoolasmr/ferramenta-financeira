import { NextRequest } from 'next/server';
import { CanonicalEvent, SignatureVerificationResult } from './types';

export interface Connector {
    verifySignature(req: NextRequest, body: string): Promise<SignatureVerificationResult>;
    normalize(body: unknown, headers?: Headers): CanonicalEvent[];
    // Apply is usually logic that touches the DB, so it might be separate or part of the class
}

// In Next.js App Router, headers are async or object. 
// We define a cleaner interface for our specialized connectors.
