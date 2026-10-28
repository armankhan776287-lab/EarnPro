/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  User as FirebaseUser,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Scope minimization: only access files created by this app
export const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

// In-memory token cache ONLY - NEVER persist OAuth tokens to localStorage / sessionStorage
let cachedAccessToken: string | null = null;
let cachedGoogleUser: GoogleDriveUserInfo | null = null;

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const driveAuth = getAuth(app);

export interface GoogleDriveUserInfo {
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
}

export interface DriveUploadResult {
  id: string;
  name: string;
  webViewLink: string;
}

/**
 * Check if the user currently has an active in-memory Google Drive session.
 */
export function getDriveAuthState(): {
  isConnected: boolean;
  user: GoogleDriveUserInfo | null;
} {
  return {
    isConnected: !!cachedAccessToken,
    user: cachedGoogleUser,
  };
}

/**
 * Sign in with Google Popup and request the Drive file scope.
 */
export async function connectGoogleDrive(): Promise<{
  accessToken: string;
  user: GoogleDriveUserInfo;
}> {
  const provider = new GoogleAuthProvider();
  SCOPES.forEach(scope => provider.addScope(scope));
  // Prompt consent if needed
  provider.setCustomParameters({
    prompt: 'consent',
    access_type: 'offline',
  });

  const credential = await signInWithPopup(driveAuth, provider);
  const oauthCredential = GoogleAuthProvider.credentialFromResult(credential);

  if (!oauthCredential || !oauthCredential.accessToken) {
    throw new Error('Failed to obtain Google Drive authorization token.');
  }

  cachedAccessToken = oauthCredential.accessToken;
  cachedGoogleUser = {
    email: credential.user.email,
    displayName: credential.user.displayName,
    photoURL: credential.user.photoURL,
  };

  return {
    accessToken: cachedAccessToken,
    user: cachedGoogleUser,
  };
}

/**
 * Disconnect Google Drive session and clear in-memory token.
 */
export async function disconnectGoogleDrive(): Promise<void> {
  cachedAccessToken = null;
  cachedGoogleUser = null;
  try {
    await firebaseSignOut(driveAuth);
  } catch (err) {
    console.error('Error signing out of Google Auth:', err);
  }
}

/**
 * Upload a file directly to the user's Google Drive root folder.
 * Uses the official Google Drive v3 multipart upload endpoint.
 *
 * @param fileName The name of the file to save (e.g. "EarnPro_Statement_2026.csv")
 * @param content The text/CSV or data content
 * @param mimeType MIME type, default 'text/csv'
 */
export async function uploadToGoogleDrive(
  fileName: string,
  content: string,
  mimeType = 'text/csv'
): Promise<DriveUploadResult> {
  if (!cachedAccessToken) {
    // Attempt connecting if token is missing
    const authRes = await connectGoogleDrive();
    if (!authRes.accessToken) {
      throw new Error('Google Drive authorization required.');
    }
  }

  const boundary = '-------EarnProDriveBoundary' + Date.now();
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadata = {
    name: fileName,
    mimeType: mimeType,
    description: 'Generated and exported from EarnPro Micro-Earning Platform',
  };

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}\r\n\r\n` +
    content +
    closeDelimiter;

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cachedAccessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    }
  );

  if (response.status === 401) {
    // Token expired; clear in-memory cache and prompt reconnection
    cachedAccessToken = null;
    throw new Error('Google Drive session expired. Please reconnect your Google account.');
  }

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(
      errorJson?.error?.message || `Failed to save file to Google Drive (Status: ${response.status})`
    );
  }

  const data = await response.json();
  return {
    id: data.id,
    name: data.name,
    webViewLink: data.webViewLink || `https://drive.google.com/file/d/${data.id}/view`,
  };
}
