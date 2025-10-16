/**
 * LTI 1.3 type definitions
 */

export type LTIRole = 'Learner' | 'Instructor' | 'Administrator' | 'ContentDeveloper';

export interface LTILaunchClaims {
  iss: string;
  aud: string;
  sub: string;
  exp: number;
  iat: number;
  nonce: string;
  'https://purl.imsglobal.org/spec/lti/claim/message_type': string;
  'https://purl.imsglobal.org/spec/lti/claim/version': string;
  'https://purl.imsglobal.org/spec/lti/claim/deployment_id': string;
  'https://purl.imsglobal.org/spec/lti/claim/target_link_uri': string;
  'https://purl.imsglobal.org/spec/lti/claim/resource_link': {
    id: string;
    title?: string;
    description?: string;
  };
  'https://purl.imsglobal.org/spec/lti/claim/roles': string[];
  'https://purl.imsglobal.org/spec/lti/claim/context'?: {
    id: string;
    label?: string;
    title?: string;
    type?: string[];
  };
  'https://purl.imsglobal.org/spec/lti/claim/launch_presentation'?: {
    document_target?: string;
    return_url?: string;
    locale?: string;
  };
  'https://purl.imsglobal.org/spec/lti-nrps/claim/namesroleservice'?: {
    context_memberships_url: string;
    service_versions: string[];
  };
  'https://purl.imsglobal.org/spec/lti-ags/claim/endpoint'?: {
    scope: string[];
    lineitems?: string;
    lineitem?: string;
  };
  name?: string;
  given_name?: string;
  family_name?: string;
  email?: string;
  [key: string]: unknown;
}

export interface LTIDeepLinkingSettings {
  deep_link_return_url: string;
  accept_types: string[];
  accept_presentation_document_targets: string[];
  accept_multiple?: boolean;
  auto_create?: boolean;
  title?: string;
  text?: string;
  data?: string;
}

export interface LTISession {
  sessionId: string;
  userId: string;
  userName: string;
  userEmail?: string;
  courseId: string;
  courseName: string;
  roles: LTIRole[];
  platformIssuer: string;
  deploymentId: string;
  resourceLinkId: string;
  createdAt: Date;
  expiresAt: Date;
}
