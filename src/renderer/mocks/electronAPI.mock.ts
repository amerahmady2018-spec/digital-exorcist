/**
 * Mock Electron API for Web Demo
 * 
 * This provides fake implementations of all electronAPI methods
 * so the app can run in a browser without Electron.
 */

import type { 
  ClassifiedFile, 
  MonsterType,
  SwiftPurgeScanResult,
  SwiftPurgeExecuteResult,
  SwiftPurgeScanProgress
} from '../../shared/types';
import { MonsterType as MT } from '../../shared/types';

// Mock file data for demo
const MOCK_SCAN_FILES: ClassifiedFile[] = [
  // Ghosts (old files)
  {
    path: 'C:/Users/Demo/Downloads/setup_wizard_2019.exe',
    size: 45 * 1024 * 1024,
    lastModified: new Date('2019-03-15'),
    classifications: [MT.Ghost]
  },
  {
    path: 'C:/Users/Demo/Documents/quarterly_report_Q2_2020.docx',
    size: 2.5 * 1024 * 1024,
    lastModified: new Date('2020-07-22'),
    classifications: [MT.Ghost]
  },
  {
    path: 'C:/Users/Demo/Desktop/vacation_notes_2018.txt',
    size: 12 * 1024,
    lastModified: new Date('2018-08-10'),
    classifications: [MT.Ghost]
  },
  // Zombies (duplicates)
  {
    path: 'C:/Users/Demo/Pictures/photo_backup_copy(2).jpg',
    size: 8 * 1024 * 1024,
    lastModified: new Date('2023-01-15'),
    classifications: [MT.Zombie]
  },
  {
    path: 'C:/Users/Demo/Downloads/project_final_FINAL_v3.zip',
    size: 156 * 1024 * 1024,
    lastModified: new Date('2023-06-20'),
    classifications: [MT.Zombie]
  },
  // Demons (large files)
  {
    path: 'C:/Users/Demo/Videos/screen_recording_unedited.mp4',
    size: 2.8 * 1024 * 1024 * 1024,
    lastModified: new Date('2024-02-10'),
    classifications: [MT.Demon]
  },
  {
    path: 'C:/Users/Demo/Downloads/game_installer_deluxe.iso',
    size: 45 * 1024 * 1024 * 1024,
    lastModified: new Date('2023-11-05'),
    classifications: [MT.Demon]
  }
];

// Track banished files for demo
let banishedFiles: string[] = [];
let graveyardFiles: Array<{ path: string; originalPath: string }> = [];
let undoCounter = 0;

// Progress callback storage
let scanProgressCallback: ((progress: { filesScanned: number; currentPath: string }) => void) | null = null;
let swiftPurgeProgressCallback: ((progress: SwiftPurgeScanProgress) => void) | null = null;

/**
 * Simulate async delay for realistic feel
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Mock Electron API implementation
 */
export const mockElectronAPI = {
  // Window controls (no-op in web)
  windowMinimize: async () => ({ success: true }),
  windowMaximize: async () => ({ success: true, isMaximized: false }),
  windowClose: async () => ({ success: true }),
  windowIsMaximized: async () => ({ isMaximized: false }),

  // Directory selection - returns mock path
  selectDirectory: async () => {
    await delay(100);
    return { 
      success: true, 
      path: 'C:/Users/Demo/Downloads' 
    };
  },

  // File selection
  selectFile: async () => {
    await delay(100);
    return {
      success: true,
      path: 'C:/Users/Demo/Downloads/large_file.zip',
      fileName: 'large_file.zip',
      size: 500 * 1024 * 1024
    };
  },

  // Get user folder
  getUserFolder: async (folderName: string) => {
    const folders: Record<string, string> = {
      downloads: 'C:/Users/Demo/Downloads',
      desktop: 'C:/Users/Demo/Desktop',
      documents: 'C:/Users/Demo/Documents',
      pictures: 'C:/Users/Demo/Pictures'
    };
    return { 
      success: true, 
      path: folders[folderName] || 'C:/Users/Demo' 
    };
  },

  // Scanning - simulates progress
  startScan: async (dirPath: string) => {
    // Simulate scanning progress
    const paths = [
      'Scanning system files...',
      'Analyzing downloads folder...',
      'Checking for duplicates...',
      'Identifying large files...',
      'Detecting old files...',
      'Finalizing scan...'
    ];

    for (let i = 0; i < paths.length; i++) {
      await delay(300);
      if (scanProgressCallback) {
        scanProgressCallback({
          filesScanned: (i + 1) * 50,
          currentPath: paths[i]
        });
      }
    }

    return {
      success: true,
      files: MOCK_SCAN_FILES.map(f => ({
        path: f.path,
        size: f.size,
        lastModified: f.lastModified
      })),
      count: MOCK_SCAN_FILES.length
    };
  },

  cancelScan: async () => ({ success: true }),

  onScanProgress: (callback: (progress: { filesScanned: number; currentPath: string }) => void) => {
    scanProgressCallback = callback;
    return () => { scanProgressCallback = null; };
  },

  onScanComplete: (callback: (files: any[]) => void) => {
    // Not used in mock
    return () => {};
  },

  // Classification
  classifyFiles: async (files: any[]) => {
    await delay(500);
    return {
      success: true,
      files: MOCK_SCAN_FILES.filter(f => !banishedFiles.includes(f.path)),
      count: MOCK_SCAN_FILES.length - banishedFiles.length
    };
  },


  // File operations
  banishFile: async (filePath: string, classifications?: MonsterType[], fileSize?: number) => {
    await delay(300);
    banishedFiles.push(filePath);
    const undoId = `undo-${++undoCounter}`;
    
    // Add to graveyard
    graveyardFiles.push({
      path: `graveyard_trash/${filePath.split('/').pop()}`,
      originalPath: filePath
    });

    return {
      success: true,
      undoId,
      graveyardPath: `graveyard_trash/${filePath.split('/').pop()}`
    };
  },

  resurrectFile: async (filePath: string) => {
    await delay(200);
    return { success: true, message: 'File resurrected (demo)' };
  },

  restoreFile: async (graveyardPath: string, originalPath: string) => {
    await delay(300);
    banishedFiles = banishedFiles.filter(f => f !== originalPath);
    graveyardFiles = graveyardFiles.filter(f => f.originalPath !== originalPath);
    return { 
      success: true, 
      restoredPath: originalPath 
    };
  },

  // Data queries
  getLogEntries: async () => {
    return [
      {
        id: '1',
        timestamp: new Date().toISOString(),
        actionType: 'banish',
        filePath: 'C:/Users/Demo/Downloads/old_file.exe',
        fileSize: 45000000,
        classifications: ['ghost'],
        success: true
      }
    ];
  },

  getWhitelist: async () => {
    return [
      'C:/Users/Demo/Documents/important.docx',
      'C:/Users/Demo/Pictures/family_photo.jpg'
    ];
  },

  removeFromWhitelist: async (filePath: string) => {
    return { success: true, message: 'Removed from whitelist (demo)' };
  },

  getGraveyardFiles: async () => {
    return graveyardFiles;
  },

  // AI file inspection - mock response
  inspectFileAgent: async (request: any) => {
    await delay(800);
    return {
      success: true,
      recommendation: 'SAFE_TO_DELETE',
      confidence: 0.85,
      reasoning: 'This appears to be a temporary or outdated file that is safe to remove.',
      details: {
        fileType: 'Temporary/Cache file',
        lastAccessed: '6 months ago',
        associatedProgram: 'Unknown'
      }
    };
  },

  // Undo banish
  undoBanish: async (undoId: string) => {
    await delay(200);
    if (banishedFiles.length > 0) {
      const restored = banishedFiles.pop();
      graveyardFiles = graveyardFiles.filter(f => f.originalPath !== restored);
      return { 
        success: true, 
        restoredPath: restored 
      };
    }
    return { 
      success: false, 
      error: 'Nothing to undo' 
    };
  },

  // Swift Purge APIs
  swiftPurgeScan: async (targetPath: string) => {
    // Simulate progress
    const phases: Array<'scanning' | 'hashing' | 'classifying'> = ['scanning', 'hashing', 'classifying'];
    
    for (let i = 0; i < phases.length; i++) {
      await delay(600);
      if (swiftPurgeProgressCallback) {
        swiftPurgeProgressCallback({
          phase: phases[i],
          filesScanned: (i + 1) * 100,
          currentPath: targetPath
        });
      }
    }

    // Convert ClassifiedFiles to SwiftPurgeFileEntry format
    const mockFiles: Array<{
      path: string;
      fileName: string;
      size: number;
      lastModified: Date;
      classification: 'ghost' | 'zombie' | 'demon';
    }> = [
      {
        path: 'C:/Users/Demo/Downloads/setup_wizard_2019.exe',
        fileName: 'setup_wizard_2019.exe',
        size: 45 * 1024 * 1024,
        lastModified: new Date('2019-03-15'),
        classification: 'ghost'
      },
      {
        path: 'C:/Users/Demo/Documents/quarterly_report_Q2_2020.docx',
        fileName: 'quarterly_report_Q2_2020.docx',
        size: 2.5 * 1024 * 1024,
        lastModified: new Date('2020-07-22'),
        classification: 'ghost'
      },
      {
        path: 'C:/Users/Demo/Desktop/vacation_notes_2018.txt',
        fileName: 'vacation_notes_2018.txt',
        size: 12 * 1024,
        lastModified: new Date('2018-08-10'),
        classification: 'ghost'
      },
      {
        path: 'C:/Users/Demo/Pictures/photo_backup_copy(2).jpg',
        fileName: 'photo_backup_copy(2).jpg',
        size: 8 * 1024 * 1024,
        lastModified: new Date('2023-01-15'),
        classification: 'zombie'
      },
      {
        path: 'C:/Users/Demo/Downloads/project_final_FINAL_v3.zip',
        fileName: 'project_final_FINAL_v3.zip',
        size: 156 * 1024 * 1024,
        lastModified: new Date('2023-06-20'),
        classification: 'zombie'
      },
      {
        path: 'C:/Users/Demo/Videos/screen_recording_unedited.mp4',
        fileName: 'screen_recording_unedited.mp4',
        size: 2.8 * 1024 * 1024 * 1024,
        lastModified: new Date('2024-02-10'),
        classification: 'demon'
      },
      {
        path: 'C:/Users/Demo/Downloads/game_installer_deluxe.iso',
        fileName: 'game_installer_deluxe.iso',
        size: 45 * 1024 * 1024 * 1024,
        lastModified: new Date('2023-11-05'),
        classification: 'demon'
      }
    ];

    const ghosts = mockFiles.filter(f => f.classification === 'ghost');
    const zombies = mockFiles.filter(f => f.classification === 'zombie');
    const demons = mockFiles.filter(f => f.classification === 'demon');

    const result: SwiftPurgeScanResult = {
      sessionId: `session-${Date.now()}`,
      targetPath,
      files: mockFiles,
      totalFilesScanned: 347,
      totalBytes: mockFiles.reduce((sum, f) => sum + f.size, 0),
      limitReached: false,
      counts: {
        ghosts: ghosts.length,
        zombies: zombies.length,
        demons: demons.length
      }
    };

    return { success: true, result };
  },

  swiftPurgeExecute: async (scanResult: SwiftPurgeScanResult) => {
    // Simulate progress during execution
    const totalFiles = scanResult.files.length;
    for (let i = 0; i <= totalFiles; i++) {
      await delay(200);
      if (swiftPurgeProgressCallback) {
        swiftPurgeProgressCallback({
          phase: 'executing',
          filesScanned: i,
          currentPath: `${i}/${totalFiles} - Moving files to Graveyard...`
        });
      }
    }
    
    const result: SwiftPurgeExecuteResult = {
      success: true,
      sessionId: scanResult.sessionId,
      purgedCount: scanResult.files.length,
      bytesFreed: scanResult.totalBytes,
      errors: [],
      undoSessionId: `undo-session-${Date.now()}`,
      undoExpiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 min
    };
    
    return result;
  },

  swiftPurgeUndo: async (sessionId: string) => {
    await delay(500);
    return {
      success: true,
      restoredCount: 7,
      errors: []
    };
  },

  onSwiftPurgeProgress: (callback: (progress: SwiftPurgeScanProgress) => void) => {
    swiftPurgeProgressCallback = callback;
    return () => { swiftPurgeProgressCallback = null; };
  },

  // Error handling
  onError: (callback: (error: string) => void) => {
    return () => {};
  }
};

/**
 * Initialize mock API on window object
 */
export function initMockElectronAPI() {
  if (typeof window !== 'undefined' && !window.electronAPI) {
    (window as any).electronAPI = mockElectronAPI;
    console.log('🎮 Web Demo Mode: Mock Electron API initialized');
  }
}
