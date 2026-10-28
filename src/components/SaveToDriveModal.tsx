/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2,
  HardDrive,
  FileSpreadsheet,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import {
  getDriveAuthState,
  connectGoogleDrive,
  disconnectGoogleDrive,
  uploadToGoogleDrive,
  GoogleDriveUserInfo,
  DriveUploadResult,
} from '../utils/googleDrive.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface SaveToDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  fileDescription?: string;
  getContent: () => string | Promise<string>;
  mimeType?: string;
}

export function SaveToDriveModal({
  isOpen,
  onClose,
  fileName,
  fileDescription,
  getContent,
  mimeType = 'text/csv',
}: SaveToDriveModalProps) {
  const { t } = useAuth();
  const [authState, setAuthState] = useState<{
    isConnected: boolean;
    user: GoogleDriveUserInfo | null;
  }>(getDriveAuthState());

  const [connecting, setConnecting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<DriveUploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setAuthState(getDriveAuthState());
      setUploadResult(null);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConnect = async () => {
    setConnecting(true);
    setError(null);
    try {
      const res = await connectGoogleDrive();
      setAuthState({ isConnected: true, user: res.user });
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Google Drive connection cancelled or failed.');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    await disconnectGoogleDrive();
    setAuthState({ isConnected: false, user: null });
    setUploadResult(null);
  };

  const handleConfirmAndUpload = async () => {
    setUploading(true);
    setError(null);
    try {
      const content = await getContent();
      const result = await uploadToGoogleDrive(fileName, content, mimeType);
      setUploadResult(result);
    } catch (err: any) {
      console.error('Drive upload error:', err);
      setError(err?.message || 'Failed to upload to Google Drive.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          disabled={uploading}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200/50 dark:border-blue-800/50">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              {t.saveToGoogleDrive}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Direct cloud export to your personal Google Drive
            </p>
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">{error}</div>
          </div>
        )}

        {/* Step 1: Success State */}
        {uploadResult ? (
          <div className="space-y-4 py-2 text-center animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                {t.driveUploadSuccess}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono break-all">
                {uploadResult.name}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-medium">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                Google Drive Root
              </span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                Ready to view
              </span>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <a
                href={uploadResult.webViewLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                <span>{t.openInGoogleDrive}</span>
              </a>

              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        ) : !authState.isConnected ? (
          /* Step 2: Need Google Auth */
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                <span className="font-mono">{fileName}</span>
              </div>
              {fileDescription && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {fileDescription}
                </p>
              )}
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="font-bold">OAuth 2.0 Drive File Permission</p>
                <p className="text-[11px] mt-0.5 opacity-90">
                  EarnPro requests permission to only create and manage the file exported by this app (<code className="font-mono text-[10px]">drive.file</code> scope). We cannot view or edit any of your other existing files.
                </p>
              </div>
            </div>

            <button
              onClick={handleConnect}
              disabled={connecting}
              className="w-full py-3 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 text-slate-800 dark:text-white font-bold text-xs flex items-center justify-center gap-3 shadow-xs hover:shadow-md transition-all disabled:opacity-50"
            >
              {connecting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span>Connecting Google Account...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{t.connectGoogleDrive}</span>
                </>
              )}
            </button>
          </div>
        ) : (
          /* Step 3: Connected & Confirmation Step */
          <div className="space-y-4 py-2">
            {/* Account Bar */}
            <div className="p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 overflow-hidden">
                {authState.user?.photoURL ? (
                  <img
                    src={authState.user.photoURL}
                    alt="Google Avatar"
                    className="w-7 h-7 rounded-full border border-blue-300 dark:border-blue-700"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                    {authState.user?.displayName?.[0] || 'G'}
                  </div>
                )}
                <div className="truncate">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    {authState.user?.displayName || 'Google Account'}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {authState.user?.email}
                  </p>
                </div>
              </div>

              <button
                onClick={handleDisconnect}
                disabled={uploading}
                title="Disconnect Google Drive"
                className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Target File Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-mono truncate">{fileName}</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {fileDescription || 'Structured CSV statement export.'}
              </p>
            </div>

            {/* Strict Confirmation Prompt (required by security & workspace skill) */}
            <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-slate-900 dark:text-white">
                <HardDrive className="w-3.5 h-3.5 text-blue-600" />
                {t.confirmDriveUpload}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                This will create and save <strong className="text-slate-700 dark:text-slate-200">{fileName}</strong> into your Google Drive root directory.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={onClose}
                disabled={uploading}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAndUpload}
                disabled={uploading}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition-all disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving to Drive...</span>
                  </>
                ) : (
                  <>
                    <HardDrive className="w-4 h-4" />
                    <span>Confirm & Save</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
