// Stitch API client for Google Cloud MCP integration
// Uses the VITE_STITCH_API_KEY and VITE_STITCH_ENDPOINT environment variables

// Types for stitch API responses
export interface StitchResponse<T = any> {
  data: T;
  status: 'success' | 'error';
  error?: string;
}

/**
 * Makes a POST request to the Google stitch MCP endpoint
 * @param path - The MCP path to call (e.g., '/generate', '/analyze')
 * @param body - The request body
 * @returns The parsed response data
 */
export async function stitchCall<T>(
  path: string,
  body: Record<string, unknown>
): Promise<T> {
  const endpoint = import.meta.env.VITE_STITCH_ENDPOINT;
  const apiKey = import.meta.env.VITE_STITCH_API_KEY;

  if (!endpoint || !apiKey) {
    throw new Error(
      'Stitch API not configured. Please set VITE_STITCH_ENDPOINT and VITE_STITCH_API_KEY environment variables.'
    );
  }

  const response = await fetch(`${endpoint}${path}`, {
    method: 'POST',
    headers: {
      'X-Goog-Api-Key': apiKey,
      'Content-Type': 'application/json',
      'X-Goog-User-Project': import.meta.env.VITE_SUPABASE_URL?.replace('https://', '') || undefined,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Stitch API error: ${response.status} ${response.statusText}`,
      { cause: errorData }
    );
  }

  return (await response.json()) as T;
}

/**
 * Checks if the stitch API is properly configured
 * @returns True if both endpoint and API key are set
 */
export function isStitchConfigured(): boolean {
  return !!(import.meta.env.VITE_STITCH_ENDPOINT && import.meta.env.VITE_STITCH_API_KEY);
}

/**
 * Generates a family tree or genealogy using the stitch AI service
 * @param treeData - The family tree data structure
 * @returns Promise resolving to the generated result
 */
export async function generateTree(
  treeData: Record<string, unknown>
): Promise<StitchResponse> {
  return stitchCall('/generate/tree', treeData);
}

/**
 * Analyzes a family tree for patterns, insights, or issues
 * @param treeData - The family tree data structure
 * @returns Promise resolving to analysis results
 */
export async function analyzeTree(
  treeData: Record<string, unknown>
): Promise<StitchResponse> {
  return stitchCall('/analyze/tree', treeData);
}

/**
 * Validates family tree data for completeness and consistency
 * @param treeData - The family tree data structure
 * @returns Promise resolving to validation results
 */
export async function validateTree(
  treeData: Record<string, unknown>
): Promise<StitchResponse> {
  return stitchCall('/validate/tree', treeData);
}