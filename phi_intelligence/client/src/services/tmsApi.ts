import { getEmployeeToken } from '../contexts/EmployeeContext';

/** Phi-TMS paginated list endpoints return `data` as the array (see `paginated_response`). */
export function unwrapTmsPaginatedList<T>(body: { data?: unknown }): T[] {
  const d = body?.data;
  if (Array.isArray(d)) return d as T[];
  if (d && typeof d === 'object' && Array.isArray((d as { projects?: T[] }).projects)) {
    return (d as { projects: T[] }).projects;
  }
  return [];
}

/**
 * FastAPI redirects GET/POST /api/projects → /api/projects/. The proxy returns 307 with Location
 * pointing at TMS :6000, so fetch from :5000 fails (non-JSON / CORS). Always use trailing slash
 * for the projects collection.
 */
function normalizeTmsPath(path: string): string {
  if (path === '/projects' || path.startsWith('/projects?')) {
    const q = path.startsWith('/projects?') ? path.slice('/projects'.length) : '';
    return `/projects/${q}`;
  }
  // Same trailing-slash redirect issue as /projects/
  if (path === '/timelogs' || path.startsWith('/timelogs?')) {
    const q = path.startsWith('/timelogs?') ? path.slice('/timelogs'.length) : '';
    return `/timelogs/${q}`;
  }
  // Note: `/employees` is mounted as `@router.get("")` upstream so the canonical
  // URL has NO trailing slash; appending one triggers a 307 redirect that
  // Express's proxy doesn't relay cleanly (browser sees a NetworkError).
  return path;
}

export const tmsApi = {
  get: async <T>(url: string): Promise<T> => request<T>('GET', url),
  post: async <T>(url: string, data?: any): Promise<T> => request<T>('POST', url, data),
  put: async <T>(url: string, data?: any): Promise<T> => request<T>('PUT', url, data),
  delete: async <T>(url: string): Promise<T> => request<T>('DELETE', url),
};

async function request<T>(method: string, url: string, data?: any): Promise<T> {
  const token = getEmployeeToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Ensure url starts with /
  const path = normalizeTmsPath(url.startsWith('/') ? url : `/${url}`);
  
  try {
    const response = await fetch(`/api/tms${path}`, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    if (response.status === 401) {
      // Token expired or invalid
      sessionStorage.removeItem('employeeToken');
      window.location.href = '/employee/login';
      throw new Error('Unauthorized');
    }

    // Read once, then attempt to parse as JSON. Some upstream layers (proxy
    // 502s, Express rate-limit, Nginx pages) return HTML/text and would crash
    // a blind JSON.parse with the unhelpful "unexpected character at line 1
    // column 1" message that hides the real status code from the caller.
    const raw = await response.text();
    let json: any = null;
    if (raw) {
      try {
        json = JSON.parse(raw);
      } catch {
        json = null;
      }
    }

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error(
          (json && (json.message || json.detail)) ||
            'Too many requests, please slow down and try again in a moment.',
        );
      }
      const message =
        (json && (json.message || json.detail)) ||
        (raw && raw.length < 200 ? raw : `Request failed with status ${response.status}`);
      throw new Error(message);
    }

    return (json ?? {}) as T;
  } catch (error) {
    console.error(`TMS API Error [${method} ${url}]:`, error);
    throw error;
  }
}
