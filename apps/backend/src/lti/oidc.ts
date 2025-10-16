/**
 * LTI 1.3 OIDC Login Handler
 */

import type { FastifyRequest, FastifyReply } from 'fastify';

interface OIDCLoginParams {
  iss: string;
  login_hint: string;
  target_link_uri: string;
  lti_message_hint?: string;
  client_id: string;
  deployment_id?: string;
  lti_deployment_id?: string;
}

/**
 * Handle OIDC login initiation from LMS
 * Validates parameters and redirects to platform auth endpoint
 */
export async function handleOIDCLogin(
  request: FastifyRequest<{ Querystring: OIDCLoginParams }>,
  reply: FastifyReply
) {
  const { iss, login_hint, target_link_uri, lti_message_hint, client_id } = request.query;

  // Validate required parameters
  if (!iss || !login_hint || !target_link_uri || !client_id) {
    return reply.status(400).send({
      error: 'Missing required OIDC parameters',
      required: ['iss', 'login_hint', 'target_link_uri', 'client_id'],
    });
  }

  // TODO: Validate issuer against configured platforms
  const platformAuthUrl = process.env.PLATFORM_AUTH_LOGIN_URL;
  if (!platformAuthUrl) {
    return reply.status(500).send({
      error: 'Platform authentication URL not configured',
    });
  }

  // Generate state and nonce for security
  const state = generateRandomString(32);
  const nonce = generateRandomString(32);

  // TODO: Store state and nonce in session/cache for validation
  // session.set(state, { nonce, timestamp: Date.now() })

  // Build authorization redirect URL
  const authUrl = new URL(platformAuthUrl);
  authUrl.searchParams.set('scope', 'openid');
  authUrl.searchParams.set('response_type', 'id_token');
  authUrl.searchParams.set('response_mode', 'form_post');
  authUrl.searchParams.set('prompt', 'none');
  authUrl.searchParams.set('client_id', client_id);
  authUrl.searchParams.set('redirect_uri', process.env.LTI_TOOL_URL + '/lti/launch');
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('nonce', nonce);
  authUrl.searchParams.set('login_hint', login_hint);
  if (lti_message_hint) {
    authUrl.searchParams.set('lti_message_hint', lti_message_hint);
  }

  request.log.info({ iss, client_id, state }, 'OIDC login initiated');

  return reply.redirect(302, authUrl.toString());
}

function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
