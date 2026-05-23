import { auth } from '@/lib/auth';
import { NextRequest } from 'next/server';

const handler = auth.handler();

export const GET = async (req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) => {
  const resolvedParams = await params;
  console.log(`[Auth API] GET ${req.nextUrl.pathname}, params:`, resolvedParams);
  return handler.GET(req, { params: resolvedParams });
};
export const POST = async (req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) => {
  const resolvedParams = await params;
  console.log(`[Auth API] POST ${req.nextUrl.pathname}, params:`, resolvedParams);
  return handler.POST(req, { params: resolvedParams });
};
export const PUT = handler.PUT;
export const DELETE = handler.DELETE;
export const PATCH = handler.PATCH;
