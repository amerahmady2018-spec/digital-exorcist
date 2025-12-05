/**
 * Folder Validation Utility for Swift Purge and Confrontation modes
 * 
 * Provides safety checks to prevent scanning system-critical folders
 */

// Predefined safe locations
export const ALLOWED_LOCATIONS = {
  downloads: { 
    id: 'downloads',
    path: '~/Downloads', 
    label: 'Downloads', 
    icon: '📥',
    description: 'Scan your Downloads folder for forgotten files'
  },
  desktop: { 
    id: 'desktop',
    path: '~/Desktop', 
    label: 'Desktop', 
    icon: '🖥️',
    description: 'Clean up your Desktop clutter'
  },
  documents: { 
    id: 'documents',
    path: '~/Documents', 
    label: 'Documents', 
    icon: '📄',
    description: 'Find old documents and duplicates'
  },
  pictures: { 
    id: 'pictures',
    path: '~/Pictures', 
    label: 'Pictures', 
    icon: '🖼️',
    description: 'Locate duplicate images and old photos'
  }
} as const;

// System folders that should NEVER be scanned
const FORBIDDEN_PATHS_WINDOWS = [
  'C:\\Windows',
  'C:\\Program Files',
  'C:\\Program Files (x86)',
  'C:\\ProgramData',
  'C:\\System Volume Information',
  'C:\\$Recycle.Bin',
  'C:\\Recovery',
  'C:\\Boot',
];

const FORBIDDEN_PATHS_UNIX = [
  '/System',
  '/usr',
  '/bin',
  '/sbin',
  '/etc',
  '/var',
  '/lib',
  '/lib64',
  '/boot',
  '/root',
  '/proc',
  '/sys',
  '/dev',
];

const FORBIDDEN_PATH_PATTERNS = [
  /node_modules/i,
  /\.git/i,
  /\.kiro/i,
  /AppData[\\\/]Local[\\\/]Microsoft/i,
  /AppData[\\\/]Local[\\\/]Google/i,
  /Library[\\\/]Application Support/i,
];

/**
 * Check if a path is forbidden (system-critical)
 */
export function isForbiddenPath(path: string): boolean {
  const normalizedPath = path.replace(/\//g, '\\');
  
  // Check Windows forbidden paths
  for (const forbidden of FORBIDDEN_PATHS_WINDOWS) {
    if (normalizedPath.toLowerCase().startsWith(forbidden.toLowerCase())) {
      return true;
    }
  }
  
  // Check Unix forbidden paths
  for (const forbidden of FORBIDDEN_PATHS_UNIX) {
    if (path.startsWith(forbidden)) {
      return true;
    }
  }
  
  // Check patterns
  for (const pattern of FORBIDDEN_PATH_PATTERNS) {
    if (pattern.test(path)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Check if a path is in the allowed locations list
 */
export function isAllowedFolder(path: string): boolean {
  // If it's forbidden, it's definitely not allowed
  if (isForbiddenPath(path)) {
    return false;
  }
  
  // Check if it matches one of our predefined locations
  const normalizedPath = path.toLowerCase().replace(/\\/g, '/');
  
  for (const location of Object.values(ALLOWED_LOCATIONS)) {
    const locationPath = location.path.replace('~', '').toLowerCase();
    if (normalizedPath.includes(locationPath.replace(/^\//, ''))) {
      return true;
    }
  }
  
  // Custom folders are allowed if not forbidden
  return true;
}

/**
 * Get a warning message for custom folder selection
 */
export function getCustomFolderWarning(): string {
  return 'Custom folders may contain important files. The Digital Exorcist will scan recursively. Proceed with caution.';
}

/**
 * Get error message for forbidden path
 */
export function getForbiddenPathError(path: string): string {
  return `Cannot scan "${path}". This appears to be a system-critical folder. Please choose a different location.`;
}

/**
 * Validate a folder path before scanning
 */
export function validateFolderPath(path: string): { valid: boolean; error?: string; warning?: string } {
  if (!path || path.trim() === '') {
    return { valid: false, error: 'Please select a folder to scan.' };
  }
  
  if (isForbiddenPath(path)) {
    return { valid: false, error: getForbiddenPathError(path) };
  }
  
  // Check if it's a custom folder (not in predefined list)
  const isCustom = !Object.values(ALLOWED_LOCATIONS).some(loc => {
    const normalizedPath = path.toLowerCase().replace(/\\/g, '/');
    const locationPath = loc.path.replace('~', '').toLowerCase();
    return normalizedPath.includes(locationPath.replace(/^\//, ''));
  });
  
  if (isCustom) {
    return { valid: true, warning: getCustomFolderWarning() };
  }
  
  return { valid: true };
}
