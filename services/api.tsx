import SSLPinning from './SSLPinning';

const API_BASE_URL =
  'https://vai.bmtpc.netcreativemind.com';

const API_HOST =
  'vai.bmtpc.netcreativemind.com';

/**
 * Builds and validates a BMTPC API URL.
 */
function buildUrl(
  endpoint: string,
): string {
  /*
   * Reject HTTP requests.
   */
  if (
    endpoint
      .toLowerCase()
      .startsWith('http://')
  ) {
    throw new Error(
      'HTTP requests are not allowed.',
    );
  }

  /*
   * If a complete HTTPS URL is supplied,
   * validate the host.
   */
  if (
    endpoint
      .toLowerCase()
      .startsWith('https://')
  ) {
    const httpsPrefix = 'https://';

    const hostAndPath =
      endpoint.substring(
        httpsPrefix.length,
      );

    const suppliedHost =
      hostAndPath.split('/')[0].split(':')[0];

    if (
      suppliedHost.toLowerCase() !==
      API_HOST
    ) {
      throw new Error(
        'Requests to external API hosts are not allowed.',
      );
    }

    return endpoint;
  }

  /*
   * Normal API endpoint.
   */
  if (!endpoint.startsWith('/')) {
    endpoint = `/${endpoint}`;
  }

  return `${API_BASE_URL}${endpoint}`;
}

/**
 * GET request through native iOS SSL pinning.
 */
export async function apiGet(
  endpoint: string,
): Promise<any> {
  const url =
    buildUrl(endpoint);

  return SSLPinning.get(url);
}

/**
 * POST request through native iOS SSL pinning.
 */
export async function apiPost(
  endpoint: string,
  data: any,
): Promise<any> {
  const url =
    buildUrl(endpoint);

  const body =
    JSON.stringify(data);

  return SSLPinning.post(
    url,
    body,
  );
}



