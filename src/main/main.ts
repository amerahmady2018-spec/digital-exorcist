import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import { join, basename, dirname } from 'path';
import * as os from 'os';
import 'dotenv/config';
import { IPC_CHANNELS, FileScanResult, FileInspectionRequest, SwiftPurgeScanResult } from '../shared/types';
import { FileScanner } from './FileScanner';
import { FileClassifier } from './FileClassifier';
import { FileOperations } from './FileOperations';
import { GraveyardLog } from './GraveyardLog';
import { WhitelistManager } from './WhitelistManager';
import { getGeminiInspector } from './GeminiInspector';
import { getUndoManager } from './UndoManager';
import { SwiftPurgeScanner } from './SwiftPurgeScanner';
import { getSwiftPurgeExecutor } from './SwiftPurgeExecutor';

let mainWindow: BrowserWindow | null = null;

/**
 * Detects platform capabilities for glassmorphism effects
 */
function getPlatformWindowConfig(): Partial<Electron.BrowserWindowConstructorOptions> {
  const platform = process.platform;
  
  // macOS supports vibrancy for native blur effects
  if (platform === 'darwin') {
    return {
      vibrancy: 'under-window',
      visualEffectState: 'active'
    };
  }
  
  // Windows 10+ supports acrylic/mica effects
  if (platform === 'win32') {
    const release = os.release();
    const [major, , build] = release.split('.').map(Number);
    // Windows 10 build 17134+ supports acrylic
    if (major >= 10 && build >= 17134) {
      return {
        backgroundMaterial: 'acrylic'
      };
    }
  }
  
  // Linux and older Windows - use transparent background
  return {};
}
let whitelistManager: WhitelistManager;
let graveyardLog: GraveyardLog;
let currentScanRoot: string | null = null;
let currentScanner: FileScanner | null = null;
// Manual tracking for maximized state (workaround for transparent window bug on Windows)
let isWindowMaximized = false;

function createWindow() {
  // vite-plugin-electron sets VITE_PUBLIC for preload path
  const preloadPath = join(process.env.VITE_PUBLIC || process.cwd(), 'dist-electron/preload.js');

  console.log('Preload path:', preloadPath);
  console.log('VITE_PUBLIC:', process.env.VITE_PUBLIC);
  console.log('Dev server URL:', process.env.VITE_DEV_SERVER_URL);

  // Get platform-specific window configuration for glassmorphism
  const platformConfig = getPlatformWindowConfig();

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    // Frameless window for premium feel
    frame: false,
    // Enable resizing and maximizing
    resizable: true,
    maximizable: true,
    // Enable transparency for glassmorphism
    transparent: true,
    // Transparent background color
    backgroundColor: '#00000000',
    // Platform-specific glassmorphism settings
    ...platformConfig,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  // Load the app
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(app.getAppPath(), 'dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });


}

// App lifecycle
app.whenReady().then(async () => {
  // Initialize managers
  whitelistManager = new WhitelistManager();
  graveyardLog = new GraveyardLog();
  
  // Load whitelist on startup
  try {
    await whitelistManager.load();
  } catch (error) {
    console.error('Failed to load whitelist:', error);
  }
  
  // Ensure log file exists
  try {
    await graveyardLog.ensureLogFile();
  } catch (error) {
    console.error('Failed to initialize log file:', error);
  }

  createWindow();
  setupIpcHandlers();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers
function setupIpcHandlers() {
  // Window control handlers for custom titlebar
  ipcMain.handle('window:minimize', () => {
    if (mainWindow) {
      mainWindow.minimize();
      return { success: true };
    }
    return { success: false, error: 'No window available' };
  });

  // Store window bounds before maximizing
  let windowBoundsBeforeMaximize = { width: 1200, height: 800, x: 0, y: 0 };
  
  ipcMain.handle('window:maximize', async () => {
    if (mainWindow) {
      console.log('Window maximize toggle - currently maximized:', isWindowMaximized);
      
      if (isWindowMaximized) {
        // Restore to previous size - use setBounds for transparent windows on Windows
        mainWindow.setBounds(windowBoundsBeforeMaximize);
        isWindowMaximized = false;
      } else {
        // Save current bounds before maximizing
        windowBoundsBeforeMaximize = mainWindow.getBounds();
        mainWindow.maximize();
        isWindowMaximized = true;
      }
      
      console.log('Window maximize toggle - new state:', isWindowMaximized);
      return { success: true, isMaximized: isWindowMaximized };
    }
    return { success: false, error: 'No window available' };
  });

  ipcMain.handle('window:close', () => {
    if (mainWindow) {
      mainWindow.close();
      return { success: true };
    }
    return { success: false, error: 'No window available' };
  });

  ipcMain.handle('window:isMaximized', () => {
    return { isMaximized: isWindowMaximized };
  });

  // Directory selection handler
  ipcMain.handle(IPC_CHANNELS.SELECT_DIRECTORY, async () => {
    try {
      const result = await dialog.showOpenDialog({
        properties: ['openDirectory']
      });
      
      if (result.canceled || result.filePaths.length === 0) {
        return { success: false, path: null };
      }
      
      return { success: true, path: result.filePaths[0] };
    } catch (error) {
      console.error('Error selecting directory:', error);
      return { 
        success: false, 
        path: null, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  });

  // File selection handler (for single file purge)
  ipcMain.handle('select-file', async () => {
    try {
      const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        title: 'Select File for Purge'
      });
      
      if (result.canceled || result.filePaths.length === 0) {
        return { success: false, path: null };
      }
      
      const filePath = result.filePaths[0];
      const fileName = basename(filePath);
      
      // Get file stats for size
      const fs = await import('fs/promises');
      const stats = await fs.stat(filePath);
      
      return { 
        success: true, 
        path: filePath,
        fileName,
        size: stats.size
      };
    } catch (error) {
      console.error('Error selecting file:', error);
      return { 
        success: false, 
        path: null, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  });

  // Get user folder path handler
  ipcMain.handle('get-user-folder', async (_event, folderName: string) => {
    try {
      // Map folder names to Electron's app.getPath names
      const folderMap: Record<string, string> = {
        'downloads': 'downloads',
        'desktop': 'desktop',
        'documents': 'documents',
        'pictures': 'pictures',
        'music': 'music',
        'videos': 'videos',
        'home': 'home',
      };
      
      const electronFolderName = folderMap[folderName.toLowerCase()];
      if (!electronFolderName) {
        return { success: false, path: null, error: `Unknown folder: ${folderName}` };
      }
      
      const folderPath = app.getPath(electronFolderName as any);
      return { success: true, path: folderPath };
    } catch (error) {
      console.error('Error getting user folder:', error);
      return { 
        success: false, 
        path: null, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  });

  // File scanning handler
  ipcMain.handle(IPC_CHANNELS.START_SCAN, async (event, dirPath: string) => {
    console.log('Scan requested for:', dirPath);
    
    try {
      // Set the current scan root for file operations
      currentScanRoot = dirPath;
      
      const scanner = new FileScanner();
      currentScanner = scanner;
      
      // Forward progress events to renderer (wrapped to prevent unhandled errors)
      scanner.on('progress', (progress) => {
        try {
          if (!event.sender.isDestroyed()) {
            event.sender.send(IPC_CHANNELS.SCAN_PROGRESS, progress);
          }
        } catch (err) {
          console.warn('Could not send scan progress:', err);
        }
      });
      
      // Forward error events to renderer (wrapped to prevent unhandled errors)
      scanner.on('error', (errorInfo) => {
        try {
          if (!event.sender.isDestroyed()) {
            event.sender.send(IPC_CHANNELS.ERROR, errorInfo);
          }
        } catch (err) {
          console.warn('Could not send error event:', err);
        }
      });
      
      const results = await scanner.scanDirectory(dirPath);
      
      // Send completion event (wrapped to prevent unhandled errors)
      try {
        if (!event.sender.isDestroyed()) {
          event.sender.send(IPC_CHANNELS.SCAN_COMPLETE, results);
        }
      } catch (err) {
        console.warn('Could not send scan complete:', err);
      }
      
      currentScanner = null;
      
      return { 
        success: true, 
        files: results,
        count: results.length 
      };
    } catch (error) {
      console.error('Error during scan:', error);
      currentScanner = null;
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        files: [],
        count: 0
      };
    }
  });

  // Cancel scan handler
  ipcMain.handle(IPC_CHANNELS.CANCEL_SCAN, async () => {
    console.log('Cancel scan requested');
    
    try {
      if (currentScanner) {
        currentScanner.cancelScan();
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      console.error('Error cancelling scan:', error);
      return { success: false };
    }
  });

  // File classification handler
  ipcMain.handle(IPC_CHANNELS.CLASSIFY_FILES, async (_event, files: FileScanResult[]) => {
    console.log('Classification requested for files:', files.length);
    
    try {
      const classifier = new FileClassifier();
      const whitelist = whitelistManager.getSet();
      
      // Classify files with duplicate detection
      const classifiedFiles = await classifier.classifyFiles(files, whitelist);
      
      return { 
        success: true, 
        files: classifiedFiles,
        count: classifiedFiles.length 
      };
    } catch (error) {
      console.error('Error during classification:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error during classification',
        files: [],
        count: 0
      };
    }
  });

  // Banish file handler - now integrates with UndoManager for undo spell toast
  ipcMain.handle(IPC_CHANNELS.BANISH_FILE, async (_event, filePath: string, classifications?: any[], fileSize?: number) => {
    console.log('Banish requested for:', filePath);
    
    try {
      // Use currentScanRoot if available, otherwise use the file's parent directory
      const scanRoot = currentScanRoot || dirname(filePath);
      
      const fileOps = new FileOperations(scanRoot, '.', graveyardLog, whitelistManager);
      const result = await fileOps.banishFile(filePath, classifications, fileSize);
      
      // If banish was successful, add an undo entry
      if (result.success && result.graveyardPath) {
        const undoManager = getUndoManager();
        const undoId = undoManager.addEntry({
          timestamp: new Date(),
          operation: 'banish',
          filePath: filePath,
          graveyardPath: result.graveyardPath,
          fileSize: fileSize,
          fileName: basename(filePath)
        });
        
        // Return the undo ID along with the result
        return {
          ...result,
          undoId,
          undoExpiresAt: undoManager.getEntry(undoId)?.expiresAt.toISOString()
        };
      }
      
      return result;
    } catch (error) {
      console.error('Error during banish:', error);
      return {
        success: false,
        graveyardPath: '',
        error: error instanceof Error ? error.message : 'Unknown error during banish'
      };
    }
  });

  // Undo banish handler - restores a recently banished file (Requirements: 13.3)
  ipcMain.handle(IPC_CHANNELS.UNDO_BANISH, async (_event, undoId: string) => {
    console.log('Undo banish requested for:', undoId);
    
    try {
      const undoManager = getUndoManager();
      const result = await undoManager.executeUndo(undoId);
      
      // If undo was successful, log the restore operation
      if (result.success && result.restoredPath) {
        await graveyardLog.appendEntry({
          timestamp: new Date().toISOString(),
          action: 'restore' as any,
          filePath: result.restoredPath,
          originalPath: result.restoredPath
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error during undo banish:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during undo'
      };
    }
  });

  // Resurrect file handler
  ipcMain.handle(IPC_CHANNELS.RESURRECT_FILE, async (_event, filePath: string) => {
    console.log('Resurrect requested for:', filePath);
    
    try {
      if (!currentScanRoot) {
        return {
          success: false,
          error: 'No scan root set. Please scan a directory first.'
        };
      }
      
      const fileOps = new FileOperations(currentScanRoot, '.', graveyardLog, whitelistManager);
      await fileOps.resurrectFile(filePath);
      
      return { 
        success: true,
        message: 'File resurrected and added to whitelist'
      };
    } catch (error) {
      console.error('Error during resurrect:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during resurrect'
      };
    }
  });

  // Restore file handler
  ipcMain.handle(IPC_CHANNELS.RESTORE_FILE, async (_event, graveyardPath: string, originalPath: string) => {
    console.log('Restore requested for:', graveyardPath, 'to', originalPath);
    
    try {
      if (!currentScanRoot) {
        return {
          success: false,
          restoredPath: '',
          error: 'No scan root set. Please scan a directory first.'
        };
      }
      
      const fileOps = new FileOperations(currentScanRoot, '.', graveyardLog, whitelistManager);
      const result = await fileOps.restoreFile(graveyardPath, originalPath);
      
      return result;
    } catch (error) {
      console.error('Error during restore:', error);
      return {
        success: false,
        restoredPath: '',
        error: error instanceof Error ? error.message : 'Unknown error during restore'
      };
    }
  });

  // Get log entries handler
  ipcMain.handle(IPC_CHANNELS.GET_LOG_ENTRIES, async (_event, filter?: { actionType?: string; startDate?: string; endDate?: string }) => {
    console.log('Log entries requested with filter:', filter);
    
    try {
      // Convert string dates to Date objects if provided
      const logFilter = filter ? {
        actionType: filter.actionType as any,
        startDate: filter.startDate ? new Date(filter.startDate) : undefined,
        endDate: filter.endDate ? new Date(filter.endDate) : undefined
      } : undefined;
      
      const entries = await graveyardLog.getEntries(logFilter);
      return entries;
    } catch (error) {
      console.error('Error getting log entries:', error);
      return [];
    }
  });

  // Get whitelist handler
  ipcMain.handle(IPC_CHANNELS.GET_WHITELIST, async () => {
    console.log('Whitelist requested');
    
    try {
      const whitelist = whitelistManager.getAll();
      return whitelist;
    } catch (error) {
      console.error('Error getting whitelist:', error);
      return [];
    }
  });

  // Remove from whitelist handler
  ipcMain.handle(IPC_CHANNELS.REMOVE_FROM_WHITELIST, async (_event, filePath: string) => {
    console.log('Remove from whitelist requested for:', filePath);
    
    try {
      await whitelistManager.remove(filePath);
      return { 
        success: true,
        message: 'File removed from whitelist'
      };
    } catch (error) {
      console.error('Error removing from whitelist:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error removing from whitelist'
      };
    }
  });

  // Get graveyard files handler
  ipcMain.handle(IPC_CHANNELS.GET_GRAVEYARD_FILES, async () => {
    console.log('Graveyard files requested');
    
    try {
      // Get all banish entries from the log
      const entries = await graveyardLog.getEntries();
      const banishEntries = entries.filter(entry => entry.action === 'banish');
      
      // Map to graveyard file format
      const graveyardFiles = banishEntries.map(entry => ({
        path: entry.graveyardPath || '',
        originalPath: entry.originalPath || entry.filePath
      }));
      
      return graveyardFiles;
    } catch (error) {
      console.error('Error getting graveyard files:', error);
      return [];
    }
  });

  // Inspect file agent handler - AI-powered file analysis using Gemini
  ipcMain.handle(IPC_CHANNELS.INSPECT_FILE_AGENT, async (_event, request: FileInspectionRequest) => {
    console.log('File inspection requested for:', request.path);
    
    try {
      const inspector = getGeminiInspector();
      const result = await inspector.inspectFile(request);
      
      return {
        success: true,
        ...result
      };
    } catch (error) {
      console.error('Error during file inspection:', error);
      const inspector = getGeminiInspector();
      const fallback = inspector.getFallbackResponse(
        error instanceof Error ? error.message : 'Unknown error during inspection'
      );
      
      return {
        success: false,
        ...fallback
      };
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SWIFT PURGE TOOL MODE HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════

  // Swift Purge scan handler - scans up to 1000 files and classifies them
  ipcMain.handle(IPC_CHANNELS.SWIFT_PURGE_SCAN, async (event, targetPath: string) => {
    console.log('[SwiftPurge] Scan requested for:', targetPath);
    
    try {
      const whitelist = whitelistManager.getSet();
      const scanner = new SwiftPurgeScanner(whitelist);
      
      // Forward progress events to renderer
      scanner.on('progress', (progress) => {
        try {
          if (!event.sender.isDestroyed()) {
            event.sender.send(IPC_CHANNELS.SWIFT_PURGE_PROGRESS, progress);
          }
        } catch (err) {
          console.warn('[SwiftPurge] Could not send progress:', err);
        }
      });
      
      const result = await scanner.scan(targetPath);
      
      console.log(`[SwiftPurge] Scan complete: ${result.files.length} entities found`);
      console.log(`[SwiftPurge] Counts - Ghosts: ${result.counts.ghosts}, Zombies: ${result.counts.zombies}, Demons: ${result.counts.demons}`);
      
      return {
        success: true,
        result
      };
    } catch (error) {
      console.error('[SwiftPurge] Scan error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown scan error'
      };
    }
  });

  // Swift Purge execute handler - moves all classified files to graveyard
  ipcMain.handle(IPC_CHANNELS.SWIFT_PURGE_EXECUTE, async (event, scanResult: SwiftPurgeScanResult) => {
    console.log('[SwiftPurge] Execute requested for session:', scanResult.sessionId);
    
    try {
      const executor = getSwiftPurgeExecutor(graveyardLog);
      
      const result = await executor.execute(scanResult, (current, total) => {
        try {
          if (!event.sender.isDestroyed()) {
            event.sender.send(IPC_CHANNELS.SWIFT_PURGE_PROGRESS, {
              filesScanned: current,
              currentPath: `Moving files... ${current}/${total}`,
              phase: 'executing'
            });
          }
        } catch (err) {
          console.warn('[SwiftPurge] Could not send execute progress:', err);
        }
      });
      
      console.log(`[SwiftPurge] Execute complete: ${result.purgedCount} files purged, ${result.bytesFreed} bytes freed`);
      
      return result;
    } catch (error) {
      console.error('[SwiftPurge] Execute error:', error);
      return {
        success: false,
        sessionId: scanResult.sessionId,
        purgedCount: 0,
        bytesFreed: 0,
        errors: [{ path: scanResult.targetPath, error: error instanceof Error ? error.message : 'Unknown error' }]
      };
    }
  });

  // Swift Purge undo handler - restores all files from a session
  ipcMain.handle(IPC_CHANNELS.SWIFT_PURGE_UNDO, async (_event, sessionId: string) => {
    console.log('[SwiftPurge] Undo requested for session:', sessionId);
    
    try {
      const executor = getSwiftPurgeExecutor(graveyardLog);
      const result = await executor.undoSession(sessionId);
      
      console.log(`[SwiftPurge] Undo complete: ${result.restoredCount} files restored`);
      
      return result;
    } catch (error) {
      console.error('[SwiftPurge] Undo error:', error);
      return {
        success: false,
        restoredCount: 0,
        errors: [{ path: sessionId, error: error instanceof Error ? error.message : 'Unknown error' }]
      };
    }
  });
}
