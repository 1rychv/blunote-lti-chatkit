/**
 * LTI routes registration
 */

import type { FastifyInstance } from 'fastify';
import { handleOIDCLogin } from './oidc.js';
import { handleLTILaunch } from './launch.js';

export async function registerLTIRoutes(server: FastifyInstance) {
  // OIDC login endpoint
  server.get('/lti/oidc/login', handleOIDCLogin);

  // LTI launch endpoint (receives POST from LMS)
  server.post('/lti/launch', handleLTILaunch);

  // JWKS endpoint for tool public keys
  server.get('/lti/.well-known/jwks.json', async (request, reply) => {
    // TODO: Return tool public key in JWKS format
    return reply.send({
      keys: [
        {
          kty: 'RSA',
          kid: process.env.LTI_KID || 'blunote-lti-key-1',
          use: 'sig',
          alg: 'RS256',
          // TODO: Extract from LTI_PRIVATE_KEY_PEM
          n: 'placeholder',
          e: 'AQAB',
        },
      ],
    });
  });

  // Tool configuration endpoint
  server.get('/lti/config', async (request, reply) => {
    const toolUrl = process.env.LTI_TOOL_URL || 'http://localhost:4000';

    return reply.send({
      title: 'BluNote Assistant',
      description: 'AI-powered study assistant with ChatKit interface',
      oidc_initiation_url: `${toolUrl}/lti/oidc/login`,
      target_link_uri: `${toolUrl}/lti/launch`,
      public_jwk_url: `${toolUrl}/lti/.well-known/jwks.json`,
      scopes: [
        'https://purl.imsglobal.org/spec/lti-ags/scope/lineitem',
        'https://purl.imsglobal.org/spec/lti-ags/scope/score',
        'https://purl.imsglobal.org/spec/lti-nrps/scope/contextmembership.readonly',
      ],
      extensions: [
        {
          platform: 'canvas.instructure.com',
          privacy_level: 'public',
          settings: {
            placements: [
              {
                placement: 'course_navigation',
                message_type: 'LtiResourceLinkRequest',
                target_link_uri: `${toolUrl}/lti/launch`,
                text: 'BluNote Assistant',
                icon_url: `${toolUrl}/icon.png`,
              },
            ],
          },
        },
      ],
    });
  });

  server.log.info('LTI routes registered');
}
