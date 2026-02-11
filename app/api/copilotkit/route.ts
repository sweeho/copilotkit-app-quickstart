import {
  CopilotRuntime,
  ExperimentalEmptyAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { HttpAgent } from "@ag-ui/client";
import { NextRequest } from "next/server";

const serviceAdapter = new ExperimentalEmptyAdapter();

const runtime = new CopilotRuntime({
  agents: {
    // @ts-expect-error - version mismatch between @ag-ui/client and @copilotkit internal
    my_agent: new HttpAgent({ url: "http://localhost:8000/" }),
  }
});

export const POST = async (req: NextRequest) => {
  // Extract user info from request headers
  const body = await req.json();
  const authHeader = req.headers.get('Authorization') || '';
  const showThoughts = req.headers.get('x-show-thoughts') || 'false';

  // Extract user_id from JWT if present (for ADK user scoping)
  let username = 'demo_user';
  if (authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.slice(7);
      const payload = JSON.parse(atob(token.split('.')[1]));
      username = payload.user_id || 'demo_user';
    } catch {
      // Fall back to demo_user if token parsing fails
    }
  }

  const sessionId = req.headers.get('x-session-id') || body.sessionId || 'default';

  console.log('CopilotKit Request:', { username, sessionId, showThoughts });

  // Create agent with custom headers for user/session
  const runtime = new CopilotRuntime({
    agents: {
      my_agent: new HttpAgent({ 
        url: "http://localhost:8000/",
        headers: {
          'x-username': username,
          'x-session-id': sessionId,
          'x-show-thoughts': showThoughts,
        }
      }),
    }
  });

  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: "/api/copilotkit",
  });

  // Reconstruct request with original body
  const modifiedReq = new NextRequest(req.url, {
    method: req.method,
    headers: req.headers,
    body: JSON.stringify(body),
  });

  return handleRequest(modifiedReq);
};