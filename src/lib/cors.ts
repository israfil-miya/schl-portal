import { NextRequest, NextResponse } from 'next/server';

type CorsOptions = {
  origin?: string | string[];
  methods?: string[];
  allowedHeaders?: string[];
  credentials?: boolean;
};

export async function cors(
  req: NextRequest,
  res: NextResponse,
  options: CorsOptions = {},
) {
  const allowedOrigins = Array.isArray(options.origin)
    ? options.origin
    : options.origin?.split(',') || [];

  const methods = options.methods || [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS',
  ];
  const allowedHeaders = options.allowedHeaders || [
    'Content-Type',
    'Authorization',
  ];
  const credentials = options.credentials ?? true;

  // Handle the preflight request
  if (req.method === 'OPTIONS') {
    const requestOrigin = req.headers.get('Origin');

    if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
      res.headers.set('Access-Control-Allow-Origin', requestOrigin);
      res.headers.set('Vary', 'Origin');
    }

    res.headers.set('Access-Control-Allow-Methods', methods.join(','));
    res.headers.set('Access-Control-Allow-Headers', allowedHeaders.join(','));

    if (credentials) {
      res.headers.set('Access-Control-Allow-Credentials', 'true');
    }

    return new NextResponse(null, { status: 204 });
  }

  // For non-OPTIONS requests, set the CORS headers
  const requestOrigin = req.headers.get('Origin');

  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    res.headers.set('Access-Control-Allow-Origin', requestOrigin);
    res.headers.set('Vary', 'Origin');
  }

  if (credentials) {
    res.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  return res;
}
