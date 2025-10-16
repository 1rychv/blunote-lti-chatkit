/**
 * LTI 1.3 Launch Handler
 */

import type { FastifyRequest, FastifyReply } from 'fastify';
import { jwtVerify, importJWK, type JWK } from 'jose';
import type { LTILaunchClaims, LTISession, LTIRole } from '@blunote/shared';

interface LaunchBody {
  id_token: string;
  state: string;
}

/**
 * Handle LTI 1.3 launch (POST from LMS)
 * Validates JWT, creates session, provisions AgentKit agent
 */
export async function handleLTILaunch(
  request: FastifyRequest<{ Body: LaunchBody }>,
  reply: FastifyReply
) {
  const { id_token, state } = request.body;

  if (!id_token || !state) {
    return reply.status(400).send({
      error: 'Missing id_token or state parameter',
    });
  }

  try {
    // TODO: Validate state matches stored value
    // const storedNonce = session.get(state)

    // Decode JWT header to get key ID
    const header = JSON.parse(Buffer.from(id_token.split('.')[0], 'base64').toString());
    const kid = header.kid;

    // Fetch platform JWKS
    const jwks = await fetchPlatformJWKS();
    const jwk = jwks.keys.find((k: JWK) => k.kid === kid);
    if (!jwk) {
      throw new Error(`Key not found in JWKS: ${kid}`);
    }

    // Verify JWT
    const publicKey = await importJWK(jwk);
    const { payload } = await jwtVerify(id_token, publicKey, {
      audience: process.env.PLATFORM_CLIENT_ID,
      issuer: process.env.PLATFORM_ISSUER,
      // TODO: Validate nonce from stored value
    });

    const claims = payload as unknown as LTILaunchClaims;

    // Extract user and course info
    const session = createLTISession(claims);

    // TODO: Store session in Supabase
    // TODO: Provision AgentKit agent for this session

    request.log.info({ userId: session.userId, courseId: session.courseId }, 'LTI launch successful');

    // Return HTML with ChatKit bootstrap
    return reply.type('text/html').send(renderLaunchPage(session));
  } catch (error) {
    request.log.error({ error }, 'LTI launch failed');
    return reply.status(401).send({
      error: 'Invalid LTI launch',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Fetch platform JWKS for JWT verification
 */
async function fetchPlatformJWKS(): Promise<{ keys: JWK[] }> {
  const jwksUrl = process.env.PLATFORM_JWKS_URL;
  if (!jwksUrl) {
    throw new Error('PLATFORM_JWKS_URL not configured');
  }

  const response = await fetch(jwksUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch JWKS: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Create LTI session from launch claims
 */
function createLTISession(claims: LTILaunchClaims): LTISession {
  const roles = parseRoles(claims['https://purl.imsglobal.org/spec/lti/claim/roles']);
  const context = claims['https://purl.imsglobal.org/spec/lti/claim/context'];
  const resourceLink = claims['https://purl.imsglobal.org/spec/lti/claim/resource_link'];

  return {
    sessionId: `lti_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId: claims.sub,
    userName: claims.name || claims.given_name || 'User',
    userEmail: claims.email,
    courseId: context?.id || 'unknown',
    courseName: context?.title || context?.label || 'Course',
    roles,
    platformIssuer: claims.iss,
    deploymentId: claims['https://purl.imsglobal.org/spec/lti/claim/deployment_id'],
    resourceLinkId: resourceLink.id,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
  };
}

/**
 * Parse LTI roles into simplified role types
 */
function parseRoles(roleUrls: string[]): LTIRole[] {
  const roles: LTIRole[] = [];

  for (const url of roleUrls) {
    if (url.includes('Learner') || url.includes('Student')) {
      roles.push('Learner');
    } else if (url.includes('Instructor') || url.includes('Teacher')) {
      roles.push('Instructor');
    } else if (url.includes('Administrator')) {
      roles.push('Administrator');
    } else if (url.includes('ContentDeveloper')) {
      roles.push('ContentDeveloper');
    }
  }

  return roles.length > 0 ? roles : ['Learner'];
}

/**
 * Render initial HTML page with ChatKit app
 */
function renderLaunchPage(session: LTISession): string {
  const frontendUrl = process.env.ALLOWED_ORIGIN || 'http://localhost:5173';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BluNote Assistant - ${session.courseName}</title>
  <style>
    body { margin: 0; padding: 0; font-family: sans-serif; }
    #loading {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      flex-direction: column;
    }
  </style>
</head>
<body>
  <div id="loading">
    <h2>Loading BluNote Assistant...</h2>
    <p>Course: ${session.courseName}</p>
  </div>
  <script>
    // Inject session data
    window.__BLUNOTE_SESSION__ = ${JSON.stringify({
      sessionId: session.sessionId,
      userId: session.userId,
      userName: session.userName,
      courseId: session.courseId,
      courseName: session.courseName,
      role: session.roles[0],
    })};

    // Redirect to frontend (development mode)
    // In production, this would load the bundled ChatKit app
    window.location.href = '${frontendUrl}';
  </script>
</body>
</html>
  `.trim();
}
