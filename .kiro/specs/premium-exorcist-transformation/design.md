# Design Document

## Overview

The Premium Exorcist Transformation elevates The Digital Exorcist into a AAA-game-quality desktop experience through five major enhancements: (1) a frameless window with glassmorphism creating desktop integration, (2) a cinematic state machine flow (INTRO → MISSION_SELECT → HUD → BATTLE_ARENA), (3) AI-powered file intelligence via Google Gemini, (4) a full-screen turn-based battle system with explosive visual feedback, and (5) comprehensive keyboard controls with safety features.

This design builds upon the existing Digital Exorcist foundation, preserving all core file management functionality while wrapping it in a premium, immersive interface. The architecture maintains the Electron main/renderer separation while adding new layers for state management, AI integration, and advanced visual effects. All visual feedback is designed to be so impactful that audio is unnecessary.

## Architecture

### Enhanced Process Architecture

**Main Process (Electron/Node.js) - Extended**
- All existing file operations (scanning, classification, banishment)
- **NEW**: Frameless window configuration with transparency
- **NEW**: Google Gemini API integration for file intelligence
- **NEW**: MCP server ("Spirit Guide") for chat-based statistics
- **NEW**: Undo operation queue with time-based expiration

**Renderer Process (React) - Extended**
- All existing UI components
- **NEW**: State machine managing INTRO, MISSION_SELECT, HUD, BATTLE_ARENA states
- **NEW**: Custom titlebar with window controls
- **NEW**: Glassmorphism container with backdrop blur
- **NEW**: Battle Arena full-screen combat interface
- **NEW**: Advanced visual effects (screen shake, particles, damage numbers)
- **NEW**: Keyboard event handling system
- **NEW**: Undo toast notification system

**IPC Communication Layer - Extended**
- All existing IPC handlers
- **NEW**: `inspectFileAgent` - Sends file to Gemini for analysis
- **NEW**: `undoBanish` - Restores recently banished file
- **NEW**: `getStatistics` - Provides data for Spirit Guide MCP
- **NEW**: Window control handlers (minimize, maximize, close)

### Technology Stack Extensions

**New Dependencies:**
- **@google/generative-ai**: Google Gemini API client for AI file analysis
- **framer-motion** (enhanced usage): Advanced layoutId transitions, particle effects
- **react-use**: Hooks for keyboard event handling
- **zustand** or **xstate**: State machine management for application flow

**Enhanced Styling:**
- **Tailwind CSS**: Extended with custom glassmorphism utilities
- **CSS Custom Properties**: Dynamic values for screen shake, particle positions
- **backdrop-filter**: CSS property for blur effects (with fallbacks)

## Components and Interfaces

### Main Process Components (New/Extended)

**WindowManager**
```typescript
interface WindowConfig {
  frame: boolean;
  transparent: boolean;
  backgroundColor: string;
  vibrancy?: 'dark' | 'light'; // macOS
  backgroundMaterial?: 'acrylic'; // Windows
}

class WindowManager {
  createMainWindow(config: WindowConfig): BrowserWindow
  setupWindowControls(window: BrowserWindow): void
}
```

**GeminiInspector**
```typescript
interface FileInspectionRequest {
  path: string;
  size: number;
  lastModified: Date;
  classifications: MonsterType[];
}

interface FileInspectionResponse {
  analysis: string;
  threat_level: 'low' | 'medium' | 'high';
  recommendations: string[];
}

class GeminiInspector {
  constructor(apiKey: string)
  async inspectFile(request: FileInspectionRequest): Promise<FileInspectionResponse>
  buildPrompt(request: FileInspectionRequest): string
}
```

**UndoManager**
```typescript
interface UndoEntry {
  id: string;
  timestamp: Date;
  operation: 'banish';
  filePath: string;
  graveyardPath: string;
  expiresAt: Date;
}

class UndoManager {
  private queue: UndoEntry[] = [];
  
  addEntry(entry: Omit<UndoEntry, 'id' | 'expiresAt'>): string
  async executeUndo(id: string): Promise<RestoreResult>
  cleanExpired(): void
  getActiveEntries(): UndoEntry[]
}
```

**SpiritGuideMCP**
```typescript
interface MCPStatistics {
  totalFiles: number;
  ghostCount: number;
  demonCount: number;
  zombieCount: number;
  totalSize: number;
  graveyardSize: number;
}

class SpiritGuideMCP {
  async getStatistics(): Promise<MCPStatistics>
  formatResponse(stats: MCPStatistics, query: string): string
}
```

### Renderer Process Components (New)

**AppStateMachine**
```typescript
enum AppState {
  INTRO = 'INTRO',
  MISSION_SELECT = 'MISSION_SELECT',
  HUD = 'HUD',
  BATTLE_ARENA = 'BATTLE_ARENA'
}

interface StateContext {
  selectedDirectory?: string;
  classifiedFiles?: ClassifiedFile[];
  currentBattleFile?: ClassifiedFile;
}

interface StateMachine {
  state: AppState;
  context: StateContext;
  transition: (to: AppState, context?: Partial<StateContext>) => void;
}
```

**CustomTitlebar**
```typescript
interface TitlebarProps {
  title: string;
  onMinimize: () => void;
  onMaximize: () => void;
  onClose: () => void;
}

const CustomTitlebar = forwardRef<HTMLDivElement, TitlebarProps>((props, ref) => {
  // Draggable region with -webkit-app-region: drag
  // Traffic light buttons
  // Blended into HUD aesthetic
});
```

**GlassmorphicContainer**
```typescript
interface GlassContainerProps {
  children: React.ReactNode;
  blurIntensity?: number;
  opacity?: number;
}

const GlassmorphicContainer = forwardRef<HTMLDivElement, GlassContainerProps>((props, ref) => {
  // backdrop-filter: blur(${blurIntensity}px)
  // background: rgba(0, 0, 0, ${opacity})
  // Platform-specific fallbacks
});
```

**TitleScreen**
```typescript
interface TitleScreenProps {
  onInitialize: () => void;
}

const TitleScreen = forwardRef<HTMLDivElement, TitleScreenProps>((props, ref) => {
  // Animated glitch logo using Framer Motion
  // "INITIALIZE SYSTEM" button
  // Cinematic entrance animation
});
```

**MissionSelect**
```typescript
interface MissionSelectProps {
  onDirectorySelected: (path: string) => void;
  onScanComplete: (files: ClassifiedFile[]) => void;
}

const MissionSelect = forwardRef<HTMLDivElement, MissionSelectProps>((props, ref) => {
  // Tactical targeting map interface
  // Directory picker styled as objective selector
  // Radar sweep animation on scan
  // Progress display with HUD elements
});
```

**EnhancedHUD**
```typescript
interface EnhancedHUDProps {
  files: ClassifiedFile[];
  onEntityClick: (file: ClassifiedFile) => void;
}

const EnhancedHUD = forwardRef<HTMLDivElement, EnhancedHUDProps>((props, ref) => {
  // Vertical scrollable entity cards
  // Summary statistics with tactical styling
  // Smooth transitions when files are removed
});
```

**EntityCard**
```typescript
interface EntityCardProps {
  file: ClassifiedFile;
  onClick: () => void;
}

const EntityCard = forwardRef<HTMLDivElement, EntityCardProps>((props, ref) => {
  // Large 3D monster image breaking frame boundaries
  // Glowing health bar (file size)
  // File metadata as tactical intel
  // Hover effects with scale and glow
});
```

**BattleArena**
```typescript
interface BattleArenaProps {
  file: ClassifiedFile;
  onVictory: () => void;
  onFlee: () => void;
}

const BattleArena = forwardRef<HTMLDivElement, BattleArenaProps>((props, ref) => {
  // Full-screen 1v1 combat interface
  // Monster display with health bar
  // AI intel panel with typewriter effect
  // Combat action buttons
  // Screen shake container
  // Damage number spawner
  // Victory particle effects
});
```

**AIIntelPanel**
```typescript
interface AIIntelPanelProps {
  file: ClassifiedFile;
}

const AIIntelPanel = forwardRef<HTMLDivElement, AIIntelPanelProps>((props, ref) => {
  // "DECIPHERING SOUL SIGNATURE..." loading animation
  // Typewriter effect for AI analysis
  // Fallback message on error
  // Styled as hacking terminal
});
```

**CombatActions**
```typescript
interface CombatActionsProps {
  onDataSmash: () => void;
  onPurgeRitual: () => void;
  onFlee: () => void;
  disabled: boolean;
}

const CombatActions = forwardRef<HTMLDivElement, CombatActionsProps>((props, ref) => {
  // Three action buttons with keyboard hints
  // Disabled state during action execution
  // Hover effects and animations
});
```

**ScreenShake**
```typescript
interface ScreenShakeProps {
  intensity: number;
  duration: number;
  onComplete: () => void;
}

const useScreenShake = () => {
  const trigger = (intensity: number, duration: number) => {
    // Apply random CSS transform offsets
    // Animate back to origin
    // Queue multiple shakes
  };
  return { trigger };
};
```

**DamageNumber**
```typescript
interface DamageNumberProps {
  amount: number;
  position: { x: number; y: number };
}

const DamageNumber = forwardRef<HTMLDivElement, DamageNumberProps>((props, ref) => {
  // Gold text showing "-{amount} MB"
  // Float upward with fade-out
  // Auto-remove from DOM on complete
});
```

**ParticleEffect**
```typescript
interface ParticleEffectProps {
  type: 'dissolution' | 'impact';
  origin: { x: number; y: number };
  onComplete: () => void;
}

const ParticleEffect = forwardRef<HTMLDivElement, ParticleEffectProps>((props, ref) => {
  // Framer Motion layoutId transitions
  // Digital particle aesthetics
  // Configurable particle count and behavior
});
```

**UndoToast**
```typescript
interface UndoToastProps {
  undoId: string;
  fileName: string;
  onUndo: (id: string) => void;
  duration?: number; // default 5000ms
}

const UndoToast = forwardRef<HTMLDivElement, UndoToastProps>((props, ref) => {
  // Prominent "UNDO SPELL" button
  // Countdown timer visualization
  // Auto-dismiss after duration
  // Smooth fade-out animation
});
```

**KeyboardController**
```typescript
interface KeyBinding {
  key: string;
  action: () => void;
  context: AppState | 'global';
}

const useKeyboardControls = (bindings: KeyBinding[]) => {
  // Register keyboard event listeners
  // Filter by current app state
  // Prevent default browser behaviors
  // Show hints on UI elements
};
```

## Data Models

### State Machine Model

```typescript
type StateTransition = {
  from: AppState;
  to: AppState;
  animation?: 'fade' | 'zoom' | 'slide';
};

const allowedTransitions: StateTransition[] = [
  { from: AppState.INTRO, to: AppState.MISSION_SELECT, animation: 'fade' },
  { from: AppState.MISSION_SELECT, to: AppState.HUD, animation: 'slide' },
  { from: AppState.HUD, to: AppState.BATTLE_ARENA, animation: 'zoom' },
  { from: AppState.BATTLE_ARENA, to: AppState.HUD, animation: 'zoom' }
];
```

### Gemini API Integration

**Prompt Template:**
```
You are analyzing a file for The Digital Exorcist, a file management system.

File Details:
- Path: {path}
- Size: {size} bytes ({humanReadableSize})
- Last Modified: {lastModified}
- Classifications: {classifications}

Provide a tactical analysis of this file:
1. What type of file is this likely to be?
2. Why might it be classified as {classifications}?
3. Is it safe to delete? What are the risks?
4. Recommendation: Keep or Banish?

Keep your response concise (3-4 sentences) and use tactical, thematic language.
```

**Response Format:**
```json
{
  "analysis": "This appears to be a large media file that hasn't been accessed in months...",
  "threat_level": "medium",
  "recommendations": [
    "Verify no active projects reference this file",
    "Consider archiving instead of deletion",
    "Safe to banish if disk space is critical"
  ]
}
```

### Undo System Model

```typescript
interface UndoQueue {
  entries: Map<string, UndoEntry>;
  maxAge: number; // 5000ms (5 seconds)
}

// Cleanup runs every second
setInterval(() => undoManager.cleanExpired(), 1000);
```

### MCP Server Interface

**Spirit Guide Tool Definition:**
```json
{
  "name": "get_exorcist_stats",
  "description": "Get statistics about scanned files and classifications",
  "inputSchema": {
    "type": "object",
    "properties": {
      "query": {
        "type": "string",
        "description": "Natural language query about file statistics"
      }
    }
  }
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Glassmorphism styling consistency
*For any* glassmorphic container, the backdrop blur CSS property should be applied with appropriate fallbacks for unsupported browsers.
**Validates: Requirements 1.2**

### Property 2: Transparency opacity bounds
*For any* transparent element, the opacity value should be within the range that allows desktop wallpaper to show through while maintaining readability (0.7-0.95).
**Validates: Requirements 1.3**

### Property 3: Platform-specific window configuration
*For any* operating system, the window configuration should use platform-appropriate properties (vibrancy on macOS, backgroundMaterial on Windows).
**Validates: Requirements 1.5**

### Property 4: Maximize button state toggling
*For any* sequence of maximize button clicks, the window state should alternate between maximized and restored.
**Validates: Requirements 2.5**

### Property 5: Entity card rendering completeness
*For any* classified file in the HUD state, an entity card should be rendered with all required elements (monster image, health bar, metadata).
**Validates: Requirements 5.1, 5.2, 5.3, 5.4**

### Property 6: Health bar file size correlation
*For any* entity card, the health bar value should be proportional to the file size relative to the maximum file size in the set.
**Validates: Requirements 5.3**

### Property 7: Battle Arena state transition
*For any* entity card click, the application state should transition from HUD to BATTLE_ARENA with the clicked file as context.
**Validates: Requirements 6.1**

### Property 8: Gemini API prompt completeness
*For any* file inspection request, the constructed prompt should include all file metadata fields (path, size, lastModified, classifications).
**Validates: Requirements 7.2, 15.2**

### Property 9: Combat action button disabling
*For any* combat action execution, all action buttons should be disabled until the action completes.
**Validates: Requirements 8.5**

### Property 10: Screen shake transform application
*For any* damage event, CSS transform offsets should be applied to the shake container element.
**Validates: Requirements 9.1**

### Property 11: Screen shake randomization
*For any* two consecutive screen shake triggers, the directional offsets should be different to create varied motion.
**Validates: Requirements 9.2**

### Property 12: Screen shake reset
*For any* screen shake animation, the transform should return to identity (no offset) after completion.
**Validates: Requirements 9.3**

### Property 13: Screen shake intensity scaling
*For any* damage amount, larger damage values should produce larger screen shake offset magnitudes.
**Validates: Requirements 9.4**

### Property 14: Screen shake queueing
*For any* rapid sequence of screen shake triggers, they should execute sequentially rather than overlapping.
**Validates: Requirements 9.5**

### Property 15: Damage number spawning
*For any* damage event, a damage number component should be added to the DOM.
**Validates: Requirements 10.1**

### Property 16: Damage number formatting
*For any* damage number, the text should display the file size reduction in the format "-{amount} MB" with gold color styling.
**Validates: Requirements 10.2**

### Property 17: Damage number cleanup
*For any* damage number, it should be removed from the DOM after its animation completes.
**Validates: Requirements 10.4**

### Property 18: Damage number staggering
*For any* multiple simultaneous damage events, the damage number animations should have staggered start times.
**Validates: Requirements 10.5**

### Property 19: Banished file removal from HUD
*For any* file that is banished in the Battle Arena, it should not appear in the entity card list when returning to the HUD state.
**Validates: Requirements 11.4**

### Property 20: ENTER key confirmation
*For any* confirmation dialog, pressing ENTER should trigger the confirm action.
**Validates: Requirements 12.2**

### Property 21: ESC key cancellation
*For any* application state, pressing ESC should trigger the appropriate cancel or flee action for that state.
**Validates: Requirements 12.3**

### Property 22: Keyboard hint display
*For any* action button with a keyboard shortcut, the button should display the keyboard hint label.
**Validates: Requirements 12.4**

### Property 23: Keyboard event default prevention
*For any* keyboard shortcut, the default browser behavior should be prevented to avoid conflicts.
**Validates: Requirements 12.5**

### Property 24: Undo toast display
*For any* file banishment, an undo toast should be displayed immediately after the operation completes.
**Validates: Requirements 13.1**

### Property 25: Undo toast auto-dismiss timing
*For any* undo toast, it should be automatically dismissed after 5 seconds if not interacted with.
**Validates: Requirements 13.2**

### Property 26: State machine transition validity
*For any* state transition request, only transitions defined in the allowed transitions list should be executed.
**Validates: Requirements 14.2**

### Property 27: State transition animation triggering
*For any* state change, the appropriate transition animation should be triggered based on the transition type.
**Validates: Requirements 14.5**

### Property 28: Gemini response parsing
*For any* valid Gemini API response, the analysis text should be correctly extracted and formatted for display.
**Validates: Requirements 15.4**

### Property 29: Spirit Guide statistics accuracy
*For any* Spirit Guide query requesting file counts, the returned counts should match the actual number of files in each classification.
**Validates: Requirements 16.4**

### Property 30: Spirit Guide size aggregation accuracy
*For any* Spirit Guide query requesting size totals, the returned totals should equal the sum of file sizes in each classification.
**Validates: Requirements 16.5**

### Property 31: ForwardRef component wrapping
*For any* animated component, it should be wrapped with React.forwardRef to enable ref forwarding.
**Validates: Requirements 18.1**

### Property 32: Ref forwarding to DOM elements
*For any* forwardRef component, the ref should be correctly forwarded to the underlying DOM element.
**Validates: Requirements 18.2**

### Property 33: Framer Motion ref compatibility
*For any* Framer Motion component using forwardRef, refs should work correctly with motion components.
**Validates: Requirements 18.3**

### Property 34: Parent-child ref control
*For any* parent component with a ref to a child, the parent should be able to access the child's DOM element through the ref.
**Validates: Requirements 18.4**

### Property 35: ForwardRef TypeScript typing
*For any* forwardRef component, the TypeScript types should correctly specify both props and ref types.
**Validates: Requirements 18.5**

### Property 36: User action visual feedback
*For any* user interaction (click, keypress), visual feedback should be provided within one frame (16ms).
**Validates: Requirements 19.1**

### Property 37: Layered visual effects
*For any* major action (combat, banishment), multiple effect types should be triggered simultaneously.
**Validates: Requirements 19.2**

### Property 38: Animation frame rate
*For any* animation sequence, the frame rate should maintain at least 60fps (measured over the animation duration).
**Validates: Requirements 19.4**

### Property 39: Effect timing synchronization
*For any* combined effects, their start times should be within 50ms of each other for perceived synchronization.
**Validates: Requirements 19.5**

### Property 40: Interaction response time
*For any* user interaction, the application should respond (state change or visual feedback) within 100ms.
**Validates: Requirements 20.3**

## Error Handling

### Frameless Window Errors

**Platform Compatibility**
- Detect platform capabilities for transparency and blur
- Provide graceful fallbacks for unsupported features
- Log warnings when advanced features are unavailable

**Window Control Failures**
- Handle IPC errors when window controls fail
- Provide fallback to OS window controls if custom titlebar fails
- Display error messages for critical window operation failures

### State Machine Errors

**Invalid Transitions**
- Reject transition requests that violate the state flow
- Log attempted invalid transitions for debugging
- Maintain current state when invalid transition is requested

**Missing Context**
- Validate required context data before transitions
- Provide default values or error states for missing context
- Prevent transitions that would result in broken UI

### AI Integration Errors

**Gemini API Failures**
- Catch network errors and API errors
- Display fallback analysis when API is unavailable
- Implement retry logic with exponential backoff
- Cache recent analyses to reduce API calls

**Rate Limiting**
- Detect rate limit errors (429 status)
- Queue requests when rate limited
- Display user-friendly message about temporary unavailability
- Implement local rate limiting to prevent hitting API limits

**Invalid Responses**
- Validate API response structure
- Parse errors gracefully with fallback content
- Log malformed responses for debugging

### Visual Effect Errors

**Animation Failures**
- Catch Framer Motion errors
- Provide static fallbacks when animations fail
- Log animation errors without breaking UI

**Performance Degradation**
- Monitor frame rates during animations
- Reduce effect complexity if performance drops
- Disable non-critical effects on low-end hardware

**DOM Manipulation Errors**
- Validate elements exist before applying effects
- Clean up effect elements even if errors occur
- Prevent memory leaks from orphaned effect components

### Undo System Errors

**Expired Undo Entries**
- Gracefully handle attempts to undo expired operations
- Display message that undo window has passed
- Clean up expired entries from queue

**Restore Conflicts**
- Detect if file already exists at original location
- Offer rename or alternative location options
- Never overwrite without explicit confirmation

**File System Errors**
- Handle permission errors during undo
- Display specific error messages for different failure types
- Log errors for debugging

### Keyboard Control Errors

**Event Listener Conflicts**
- Prevent multiple listeners for same key
- Clean up listeners on component unmount
- Handle event propagation correctly

**Context Mismatches**
- Validate keyboard shortcuts are appropriate for current state
- Ignore shortcuts when input fields are focused
- Provide visual feedback when shortcuts are unavailable

## Testing Strategy

### Unit Testing

The application will use Vitest for unit testing. Unit tests will focus on:

- **Component rendering**: Verify components render with correct props
- **State machine transitions**: Test valid and invalid transitions
- **Event handlers**: Verify click and keyboard handlers trigger correct actions
- **Data formatting**: Test prompt construction, response parsing, damage number formatting
- **Error boundaries**: Test error handling for API failures, invalid data

Unit tests provide concrete examples of correct behavior and catch specific implementation bugs.

### Property-Based Testing

The application will use **fast-check** for property-based testing. Property-based tests will:

- **Run minimum 100 iterations** per property to ensure thorough coverage
- **Generate random test data**: file metadata, damage amounts, state sequences
- **Verify universal properties**: styling consistency, timing constraints, data accuracy
- **Tag each test with design property**: Using format `**Feature: premium-exorcist-transformation, Property {number}: {property_text}**`

Property-based tests verify general correctness across all possible inputs.

**Example Property Test Structure:**
```typescript
// **Feature: premium-exorcist-transformation, Property 13: Screen shake intensity scaling**
it('scales screen shake intensity with damage amount', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 1, max: 1000 }),
      fc.integer({ min: 1, max: 1000 }),
      (damage1, damage2) => {
        const intensity1 = calculateShakeIntensity(damage1);
        const intensity2 = calculateShakeIntensity(damage2);
        
        if (damage1 > damage2) {
          expect(intensity1).toBeGreaterThan(intensity2);
        } else if (damage1 < damage2) {
          expect(intensity1).toBeLessThan(intensity2);
        } else {
          expect(intensity1).toBe(intensity2);
        }
      }
    ),
    { numRuns: 100 }
  );
});
```

### Integration Testing

**State Machine Flow**
- Test complete user journeys through all states
- Verify context is correctly passed between states
- Test back navigation and state recovery

**IPC Communication**
- Test all IPC handlers with various inputs
- Verify error propagation from main to renderer
- Test concurrent IPC calls

**Visual Effect Coordination**
- Test multiple effects triggering simultaneously
- Verify cleanup of all effect elements
- Test effect queueing and sequencing

### Performance Testing

**Animation Frame Rates**
- Measure FPS during complex animations
- Test on various hardware configurations
- Identify performance bottlenecks

**Memory Usage**
- Monitor memory during long sessions
- Verify effect cleanup prevents leaks
- Test with large numbers of files

**API Response Times**
- Measure Gemini API latency
- Test timeout handling
- Verify caching effectiveness

### Manual Testing

**Visual Quality**
- Verify glassmorphism appearance on different wallpapers
- Check animation smoothness and timing
- Validate theme consistency across all screens

**User Experience**
- Test keyboard navigation flow
- Verify all interactions feel responsive
- Check that visual feedback is satisfying

**Cross-Platform**
- Test on Windows, macOS, Linux
- Verify platform-specific features work correctly
- Check fallbacks on unsupported platforms

## Implementation Notes

### Frameless Window Configuration

**Electron BrowserWindow Options:**
```typescript
const mainWindow = new BrowserWindow({
  width: 1200,
  height: 800,
  frame: false,
  transparent: true,
  backgroundColor: '#00000000',
  vibrancy: 'dark', // macOS
  backgroundMaterial: 'acrylic', // Windows 10+
  webPreferences: {
    nodeIntegration: false,
    contextIsolation: true,
    preload: path.join(__dirname, 'preload.js')
  }
});
```

**Platform Detection:**
```typescript
const platform = process.platform;
const supportsVibrancy = platform === 'darwin';
const supportsAcrylic = platform === 'win32' && os.release() >= '10.0.17134';
```

### Glassmorphism CSS

**Modern Browsers:**
```css
.glass-container {
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}
```

**Fallback for Unsupported Browsers:**
```css
@supports not (backdrop-filter: blur(20px)) {
  .glass-container {
    background: rgba(0, 0, 0, 0.95);
  }
}
```

### State Machine Implementation

**Using Zustand:**
```typescript
interface AppStore {
  state: AppState;
  context: StateContext;
  transition: (to: AppState, context?: Partial<StateContext>) => void;
}

const useAppStore = create<AppStore>((set, get) => ({
  state: AppState.INTRO,
  context: {},
  transition: (to, context) => {
    const { state: from } = get();
    const allowed = allowedTransitions.find(t => t.from === from && t.to === to);
    if (allowed) {
      set({ state: to, context: { ...get().context, ...context } });
    } else {
      console.warn(`Invalid transition from ${from} to ${to}`);
    }
  }
}));
```

### Gemini API Integration

**API Client Setup:**
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
```

**Prompt Construction:**
```typescript
function buildInspectionPrompt(file: FileInspectionRequest): string {
  return `You are analyzing a file for The Digital Exorcist, a file management system.

File Details:
- Path: ${file.path}
- Size: ${file.size} bytes (${formatBytes(file.size)})
- Last Modified: ${file.lastModified.toISOString()}
- Classifications: ${file.classifications.join(', ')}

Provide a tactical analysis of this file:
1. What type of file is this likely to be?
2. Why might it be classified as ${file.classifications.join(' and ')}?
3. Is it safe to delete? What are the risks?
4. Recommendation: Keep or Banish?

Keep your response concise (3-4 sentences) and use tactical, thematic language.`;
}
```

**Response Handling:**
```typescript
async function inspectFile(file: FileInspectionRequest): Promise<FileInspectionResponse> {
  try {
    const prompt = buildInspectionPrompt(file);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return {
      analysis: text,
      threat_level: inferThreatLevel(file),
      recommendations: extractRecommendations(text)
    };
  } catch (error) {
    if (error.status === 429) {
      throw new RateLimitError('Gemini API rate limit exceeded');
    }
    throw error;
  }
}
```

### Screen Shake Implementation

**Hook for Screen Shake:**
```typescript
function useScreenShake() {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const queueRef = useRef<Array<{ intensity: number; duration: number }>>([]);
  const isShakingRef = useRef(false);

  const trigger = useCallback((intensity: number, duration: number) => {
    queueRef.current.push({ intensity, duration });
    if (!isShakingRef.current) {
      processQueue();
    }
  }, []);

  const processQueue = async () => {
    if (queueRef.current.length === 0) {
      isShakingRef.current = false;
      return;
    }

    isShakingRef.current = true;
    const { intensity, duration } = queueRef.current.shift()!;
    
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed < duration) {
        const progress = elapsed / duration;
        const currentIntensity = intensity * (1 - progress);
        setOffset({
          x: (Math.random() - 0.5) * currentIntensity,
          y: (Math.random() - 0.5) * currentIntensity
        });
        requestAnimationFrame(animate);
      } else {
        setOffset({ x: 0, y: 0 });
        processQueue();
      }
    };
    animate();
  };

  return { offset, trigger };
}
```

### Damage Number Component

```typescript
const DamageNumber = forwardRef<HTMLDivElement, DamageNumberProps>(
  ({ amount, position }, ref) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
      const timer = setTimeout(() => setIsVisible(false), 1000);
      return () => clearTimeout(timer);
    }, []);

    if (!isVisible) return null;

    return (
      <motion.div
        ref={ref}
        initial={{ y: position.y, x: position.x, opacity: 1 }}
        animate={{ y: position.y - 100, opacity: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="absolute text-4xl font-bold text-yellow-400 pointer-events-none"
        style={{ textShadow: '0 0 10px rgba(255, 215, 0, 0.8)' }}
      >
        -{formatBytes(amount)}
      </motion.div>
    );
  }
);
```

### Keyboard Controls

```typescript
function useKeyboardControls() {
  const { state } = useAppStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default for game controls
      if (['Space', 'Enter', 'Escape'].includes(e.code)) {
        e.preventDefault();
      }

      switch (e.code) {
        case 'Space':
          if (state === AppState.BATTLE_ARENA) {
            triggerPrimaryAttack();
          }
          break;
        case 'Enter':
          confirmCurrentAction();
          break;
        case 'Escape':
          cancelOrFlee();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state]);
}
```

### Undo System

```typescript
class UndoManager {
  private queue: Map<string, UndoEntry> = new Map();
  private readonly MAX_AGE = 5000; // 5 seconds

  addEntry(operation: Omit<UndoEntry, 'id' | 'expiresAt'>): string {
    const id = crypto.randomUUID();
    const entry: UndoEntry = {
      ...operation,
      id,
      expiresAt: new Date(Date.now() + this.MAX_AGE)
    };
    this.queue.set(id, entry);
    return id;
  }

  async executeUndo(id: string): Promise<RestoreResult> {
    const entry = this.queue.get(id);
    if (!entry) {
      throw new Error('Undo entry not found or expired');
    }
    
    if (new Date() > entry.expiresAt) {
      this.queue.delete(id);
      throw new Error('Undo window has expired');
    }

    const result = await restoreFile(entry.graveyardPath, entry.filePath);
    this.queue.delete(id);
    return result;
  }

  cleanExpired(): void {
    const now = new Date();
    for (const [id, entry] of this.queue.entries()) {
      if (now > entry.expiresAt) {
        this.queue.delete(id);
      }
    }
  }
}

// Run cleanup every second
setInterval(() => undoManager.cleanExpired(), 1000);
```

### MCP Server Implementation

**Spirit Guide Server Structure:**
```typescript
// spirit-guide-mcp/index.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new Server({
  name: 'spirit-guide',
  version: '1.0.0'
}, {
  capabilities: {
    tools: {}
  }
});

server.setRequestHandler('tools/list', async () => ({
  tools: [{
    name: 'get_exorcist_stats',
    description: 'Get statistics about scanned files and classifications',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Natural language query about file statistics'
        }
      }
    }
  }]
}));

server.setRequestHandler('tools/call', async (request) => {
  if (request.params.name === 'get_exorcist_stats') {
    const stats = await getStatistics();
    return {
      content: [{
        type: 'text',
        text: formatSpiritGuideResponse(stats, request.params.arguments.query)
      }]
    };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
```

### Performance Optimization

**Virtual Scrolling for Entity Cards:**
```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

function EntityCardList({ files }: { files: ClassifiedFile[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: files.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 300, // Estimated card height
    overscan: 5
  });

  return (
    <div ref={parentRef} className="h-full overflow-auto">
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map(virtualItem => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`
            }}
          >
            <EntityCard file={files[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Effect Throttling:**
```typescript
function useThrottledEffect(callback: () => void, delay: number) {
  const lastRun = useRef(Date.now());

  return useCallback(() => {
    const now = Date.now();
    if (now - lastRun.current >= delay) {
      callback();
      lastRun.current = now;
    }
  }, [callback, delay]);
}
```

**Lazy Loading for Heavy Components:**
```typescript
const BattleArena = lazy(() => import('./components/BattleArena'));
const ParticleEffect = lazy(() => import('./components/ParticleEffect'));

// Use with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <BattleArena file={currentFile} />
</Suspense>
```

## Security Considerations

### API Key Management

**Environment Variables:**
- Store Gemini API key in `.env` file (never commit)
- Load in main process only
- Never expose to renderer process directly
- Use IPC to proxy API calls

**Key Validation:**
- Validate API key format on startup
- Provide clear error if key is missing or invalid
- Allow key configuration through settings UI

### IPC Security

**Context Isolation:**
- Enable context isolation in webPreferences
- Use preload script for IPC bridge
- Validate all IPC messages in main process

**Input Validation:**
- Sanitize file paths before operations
- Validate state transition requests
- Prevent injection attacks in prompts

### File System Safety

**Path Validation:**
- Ensure all paths are within allowed directories
- Prevent path traversal attacks
- Validate file existence before operations

**Undo Window:**
- Limit undo window to 5 seconds
- Clean up expired entries automatically
- Prevent undo of already-restored files

## Development vs Production

### Development Mode

**Features:**
- Verbose logging for all operations
- DevTools enabled by default
- Hot reload for renderer process
- Mock Gemini API responses for testing
- Extended undo window (30 seconds)

**Configuration:**
```typescript
if (process.env.NODE_ENV === 'development') {
  mainWindow.webContents.openDevTools();
  app.setPath('userData', path.join(app.getPath('userData'), 'dev'));
}
```

### Production Mode

**Features:**
- Minimal logging (errors only)
- DevTools disabled
- Optimized builds with minification
- Real Gemini API integration
- Standard undo window (5 seconds)

**Build Configuration:**
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
});
```

### Testing Mode

**Features:**
- Mock file system operations
- Deterministic random values for effects
- Disable animations for faster tests
- Mock Gemini API with predictable responses

**Test Configuration:**
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html']
    }
  }
});
```
