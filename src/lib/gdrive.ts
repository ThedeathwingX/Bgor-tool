import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from "../../firebase-applet-config.json";

// Initialize Firebase client SDK
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Configure Google Auth provider with Google Drive scopes
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive.file');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

/**
 * Listener to synchronize the user session with custom access token
 */
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else {
        // If we are recovering session on full refresh, auth state will trigger without cachedAccessToken.
        // In that case, we notify failure or request a quick login check to maintain high-security token caches.
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Triggers interactive Google popup sign-in
 */
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to retrieve OAuth access token from Google.');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Signs the user out of the Workspace Google integration
 */
export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

/**
 * Get the in-memory cached access token safely
 */
export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

export interface DriveFile {
  id: string;
  name: string;
  modifiedTime?: string;
  size?: string;
}

/**
 * Searches for a backup file by name in the user's Drive workspace
 */
export async function searchBackupFile(accessToken: string, filename: string): Promise<DriveFile | null> {
  const query = `name = '${filename}' and trashed = false`;
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,modifiedTime,size)`;
  
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || '搜尋雲端備份時出錯。');
  }
  
  const data = await res.json();
  return data.files && data.files.length > 0 ? data.files[0] : null;
}

/**
 * Retrieves a list of all backups inside the user's workspace
 */
export async function listBackups(accessToken: string): Promise<DriveFile[]> {
  const query = `name contains 'bge_backup_' and trashed = false`;
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&orderBy=modifiedTime desc&fields=files(id,name,modifiedTime,size)`;
  
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || '獲取雲端備份列表失敗。');
  }
  
  const data = await res.json();
  return data.files || [];
}

/**
 * Creates a brand new backup file with content
 */
export async function createBackupFile(accessToken: string, filename: string, content: any): Promise<string> {
  const metadataUrl = 'https://www.googleapis.com/drive/v3/files';
  const metaRes = await fetch(metadataUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: filename,
      mimeType: 'application/json',
      description: 'B哥高智效工作站 智能雲端精準備份'
    })
  });
  
  if (!metaRes.ok) {
    const err = await metaRes.json();
    throw new Error(err.error?.message || '建立雲端檔案中繼資料時出錯。');
  }
  
  const fileMeta = await metaRes.json();
  const fileId = fileMeta.id;
  
  // Feed media contents directly
  await updateBackupFileContent(accessToken, fileId, content);
  return fileId;
}

/**
 * Updates text media content of an existing Drive file
 */
export async function updateBackupFileContent(accessToken: string, fileId: string, content: any): Promise<void> {
  const uploadUrl = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`;
  
  const res = await fetch(uploadUrl, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(content, null, 2)
  });
  
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || '上傳雲端備份內容時失敗。');
  }
}

/**
 * Destructive deletion hook of an existing Drive file
 */
export async function deleteBackupFile(accessToken: string, fileId: string): Promise<void> {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}`;
  
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || '刪除雲端備份檔案失敗。');
  }
}

/**
 * Downloads a custom JSON backup configuration directly
 */
export async function downloadBackupFile(accessToken: string, fileId: string): Promise<any> {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
  
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  
  if (!res.ok) {
    throw new Error('雲端備份內容下載失敗。');
  }
  
  return res.json();
}
