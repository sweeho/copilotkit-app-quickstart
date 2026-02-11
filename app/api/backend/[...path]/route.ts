import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

/**
 * Proxy all requests to /api/backend/* → backend /api/*
 * Forwards Authorization and Content-Type headers.
 */
async function proxyRequest(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const backendPath = `/api/${path.join('/')}`;
  const url = `${BACKEND_URL}${backendPath}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const authHeader = req.headers.get('Authorization');
  if (authHeader) {
    headers['Authorization'] = authHeader;
  }

  const fetchOptions: RequestInit = {
    method: req.method,
    headers,
  };

  // Include body for POST/PUT/PATCH
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    try {
      const body = await req.json();
      fetchOptions.body = JSON.stringify(body);
    } catch {
      // Empty body is fine for some POSTs
    }
  }

  try {
    const response = await fetch(url, fetchOptions);
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error(`Proxy error for ${req.method} ${backendPath}:`, error);
    return NextResponse.json(
      { error: 'Backend service unavailable' },
      { status: 502 }
    );
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const DELETE = proxyRequest;
export const PATCH = proxyRequest;
