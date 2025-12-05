# Design Document

## Overview

The Gaming HUD UI feature transforms The Digital Exorcist from a standard web application interface into an immersive gaming heads-up display experience. This transformation applies gaming-specific visual elements including custom fonts (Creepster and Rajdhani), CRT screen effects with scanlines and flicker, animated fog backgrounds, enemy-unit-style monster cards with health bars, and militaristic weapon trigger buttons. The design maintains all existing functionality while dramatically enhancing the visual presentation to match Cyberpunk and Phasmophobia aesthetics.

## Architecture

### Component Hierarchy

The gaming HUD transformation affects three primary components:

**App.tsx (Root Level)**
- Hosts the CRT overlay effect (full-screen, pointer-events-none)
- Hosts the animated fog background (behind all content)
- Applies global font configuration via Tailwind

**ExorcismDashboard.tsx (Dashboard Level)**
- Applies gaming fonts to headers and statistics
- Maintains existing layout with enhanced visual styling
- Coordinates monster card display

**MonsterCard.tsx (Card Level)**
- Transforms into enemy unit card design
- Implements health bar visualization for file size
- Applies weapon trigger button styling to actions

### Technology Stack

- **React**: Component framework (existing)
- **Framer Motion**: Animation library (existing)
- **Tailwind CSS**: Styling with custom font configuration
- **Google Fonts**: Creepster and Rajdhani font families
- **CSS Keyframes**: For CRT flicker and fog animation
- **CSS Linear Gradients**: For scanline and fog effects
- **CSS Clip-path**: For button corner clipping

## Components and Interfaces

### Font Configuration

**Google Fonts Import (index.html)**
```html
<link href="https://fonts.googleapis.com/css2?family=Creepster&family=Rajdhani:wght@500;700&display=swap" rel="stylesheet">
```

**Tailwind Configuration (tailwind.config.js)**
```javascript
theme: {
  extend: {
    fontFamily: {
      'creepster': ['Creepster', 'cursive'],
      'tech': ['Rajdhani', 'sans-serif']
    }
  }
}
```

**Font Application Rules**
- Headers (h1, h2, h3): `font-creepster`
- Monster names: `font-creepster`
- UI text and controls: `font-tech font-bold` (weight 500 or 700)
- Body text: `font-tech` (weight 500)

### CRT Overlay Effect

**Component Structure (App.tsx)**
```tsx
<div className="fixed inset-0 pointer-events-none z-50 crt-overlay">
  {/* Scanlines and flicker effect */}
</div>
```

**CSS Implementation**
```css
.crt-overlay {
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.15) 0px,
    rgba(0, 0, 0, 0.15) 1px,
    transparent 1px,
    transparent 2px
  );
  animation: crt-flicker 0.15s infinite;
}

@keyframes crt-flicker {
  0% { opacity: 0.97; }
  50% { opacity: 1; }
  100% { opacity: 0.97; }
}
```

**Properties**
- Position: `fixed inset-0` (covers entire viewport)
- Z-index: `z-50` (above all content)
- Pointer events: `pointer-events-none` (allows clicks through)
- Scanlines: 2px repeating pattern with 1px dark line
- Flicker: 0.15s infinite animation with subtle opacity change

### Arena Background (Fog Effect)

**Component Structure (App.tsx)**
```tsx
<div className="fixed inset-0 -z-10 fog-background">
  <div className="fog-layer fog-layer-1"></div>
  <div className="fog-layer fog-layer-2"></div>
  <div className="fog-layer fog-layer-3"></div>
</div>
```

**CSS Implementation**
```css
.fog-background {
  background: radial-gradient(ellipse at center, #1a1d20 0%, #0d0f10 100%);
}

.fog-layer {
  position: absolute;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    ellipse at center,
    rgba(139, 92, 246, 0.1) 0%,
    transparent 50%
  );
  filter: blur(60px);
}

.fog-layer-1 {
  animation: fog-drift-1 30s ease-in-out infinite;
}

.fog-layer-2 {
  animation: fog-drift-2 40s ease-in-out infinite reverse;
}

.fog-layer-3 {
  animation: fog-drift-3 50s ease-in-out infinite;
}

@keyframes fog-drift-1 {
  0%, 100% { transform: translate(-10%, -10%) scale(1); }
  50% { transform: translate(10%, 10%) scale(1.1); }
}

@keyframes fog-drift-2 {
  0%, 100% { transform: translate(10%, -10%) scale(1.05); }
  50% { transform: translate(-10%, 10%) scale(1); }
}

@keyframes fog-drift-3 {
  0%, 100% { transform: translate(-5%, 10%) scale(1); }
  50% { transform: translate(5%, -10%) scale(1.1); }
}
```

**Properties**
- Position: `fixed inset-0` with `-z-10` (behind all content)
- Multiple layers: 3 fog layers with different animation timings
- Animation duration: 30s, 40s, 50s for varied movement
- Blur: 60px for soft fog effect
- Colors: Purple-tinted fog matching spectral theme

### Enemy Unit Card (MonsterCard.tsx)

**Visual Structure**
```tsx
<motion.div className="enemy-unit-card">
  {/* Jagged neon border */}
  <div className="border-2 border-red-600 shadow-[0_0_20px_red]">
    {/* Monster name with Creepster font */}
    <h3 className="font-creepster text-2xl">{fileName}</h3>
    
    {/* File metadata */}
    <div className="font-tech">{metadata}</div>
    
    {/* Health bar at bottom */}
    <div className="health-bar-container">
      <div className="health-bar" style={{ width: `${healthPercentage}%` }} />
      <span className="health-value">{fileSize}</span>
    </div>
  </div>
</motion.div>
```

**Health Bar Calculation**
```typescript
const MAX_SIZE_MB = 500; // Demons are 500MB+
const fileSizeMB = file.size / (1024 * 1024);
const healthPercentage = Math.min((fileSizeMB / MAX_SIZE_MB) * 100, 100);
```

**Styling Properties**
- Border: `border-2 border-red-600` with `shadow-[0_0_20px_rgba(239,68,68,0.6)]`
- Background: `bg-graveyard-800/40 backdrop-blur-lg`
- Corners: Sharp, no rounding
- Monster name: `font-creepster text-2xl text-white`
- Health bar: Red gradient `bg-gradient-to-r from-red-600 to-red-500`
- Health bar height: `h-3` with `rounded-sm`

### Weapon Trigger Buttons

**Button Structure**
```tsx
<motion.button
  whileHover={{ scale: 1.05, x: 2 }}
  whileTap={{ scale: 0.95 }}
  className="weapon-trigger-btn"
>
  [ PURGE ENTITY ]
</motion.button>
```

**CSS Implementation**
```css
.weapon-trigger-btn {
  @apply px-6 py-3 font-tech font-bold text-sm uppercase tracking-wider;
  @apply bg-gradient-to-r from-red-700 to-red-600;
  @apply text-white;
  @apply border border-red-500;
  clip-path: polygon(
    8px 0, 
    100% 0, 
    100% calc(100% - 8px), 
    calc(100% - 8px) 100%, 
    0 100%, 
    0 8px
  );
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.8),
               0 0 20px rgba(239, 68, 68, 0.6);
  box-shadow: 0 0 15px rgba(239, 68, 68, 0.4),
              inset 0 0 10px rgba(255, 255, 255, 0.1);
}

.weapon-trigger-btn:hover {
  animation: button-shake 0.3s ease-in-out;
}

@keyframes button-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-2px) rotate(-1deg); }
  75% { transform: translateX(2px) rotate(1deg); }
}
```

**Button Labels**
- Banish → `[ PURGE ENTITY ]`
- Resurrect → `[ SAVE SOUL ]`

**Styling Properties**
- Clipped corners: 8px clips on opposite corners
- Glowing text: Multiple text-shadow layers
- Border glow: Box-shadow with color matching
- Hover effect: Shake animation (0.3s)
- Colors: Red for PURGE, Green for SAVE SOUL

## Data Models

No new data models are required. This feature is purely visual and uses existing data structures:

- `ClassifiedFile`: Existing interface for file data
- `MonsterType`: Existing enum for classifications
- File size (bytes): Used for health bar calculation

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Font loading fallback
*For any* font loading failure, the application should fall back to system fonts without breaking layout or causing text to disappear.
**Validates: Requirements 1.5**

### Property 2: CRT overlay non-interference
*For any* user interaction (click, hover, scroll), the CRT overlay should not block or interfere with the interaction.
**Validates: Requirements 2.4**

### Property 3: Readability preservation
*For any* visual effect (CRT, fog, borders), text content should remain readable with sufficient contrast.
**Validates: Requirements 2.5, 3.5**

### Property 4: Health bar proportionality
*For any* two files with different sizes, the health bar widths should be proportional to their file sizes.
**Validates: Requirements 7.1, 7.5**

### Property 5: Health bar maximum scale
*For any* file size of 500MB or greater, the health bar should display at or near 100% width.
**Validates: Requirements 7.2**

### Property 6: Health bar minimum scale
*For any* file size less than 500MB, the health bar width should be proportionally smaller than 100%.
**Validates: Requirements 7.3**

### Property 7: Health bar data completeness
*For any* monster card, both the visual health bar and numeric file size should be displayed.
**Validates: Requirements 7.4**

### Property 8: Button label transformation
*For any* action button, the label should be transformed to uppercase gaming terminology (PURGE ENTITY or SAVE SOUL).
**Validates: Requirements 5.1, 5.2**

### Property 9: Animation smoothness
*For any* animation (flicker, fog, button hover), the animation should run at 60fps without causing jank or stuttering.
**Validates: Requirements 8.4**

### Property 10: Fog layer independence
*For any* fog layer, it should animate independently without synchronizing with other layers.
**Validates: Requirements 3.4**

### Property 11: Font application consistency
*For any* header element, the Creepster font should be applied consistently across all components.
**Validates: Requirements 1.2, 6.1**

### Property 12: Font application consistency for UI
*For any* UI text or control element, the Rajdhani font should be applied consistently across all components.
**Validates: Requirements 1.3, 6.1**

### Property 13: Functionality preservation
*For any* existing feature (scan, banish, resurrect, restore), the functionality should work identically before and after the gaming HUD transformation.
**Validates: Requirements 6.6**

### Property 14: Component coverage completeness
*For any* visual transformation (fonts, effects, styling), it should be applied to all specified components (App, ExorcismDashboard, MonsterCard).
**Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5**

## Error Handling

### Font Loading Failures

**Scenario**: Google Fonts fail to load due to network issues

**Handling**:
- Tailwind font stack includes fallbacks: `['Creepster', 'cursive']` and `['Rajdhani', 'sans-serif']`
- Browser will automatically fall back to system cursive and sans-serif fonts
- No JavaScript error handling required
- Layout remains intact due to similar font metrics

### CSS Animation Performance

**Scenario**: Animations cause performance issues on low-end hardware

**Handling**:
- Use CSS `will-change` property for animated elements
- Leverage GPU acceleration with `transform` and `opacity`
- Provide option to disable effects via user preference (future enhancement)
- Monitor frame rate and reduce animation complexity if needed

### Clip-path Browser Compatibility

**Scenario**: Older browsers don't support clip-path

**Handling**:
- Buttons will display as regular rectangles without clipped corners
- Functionality remains intact
- Consider using `@supports` CSS rule for progressive enhancement

### Z-index Conflicts

**Scenario**: CRT overlay interferes with modals or tooltips

**Handling**:
- Set CRT overlay to `z-50`
- Ensure modals and critical UI elements use `z-[60]` or higher
- Test all interactive elements for proper layering

## Testing Strategy

### Unit Testing

Unit tests will focus on:

- **Font application**: Verify correct font classes are applied to elements
- **Health bar calculation**: Test file size to percentage conversion
- **Button label transformation**: Verify "Banish" → "PURGE ENTITY" mapping
- **Component rendering**: Ensure all components render without errors
- **Functionality preservation**: Verify existing features still work

### Property-Based Testing

The application will use **fast-check** for property-based testing with minimum 100 iterations per property:

**Example Property Test**:
```typescript
// **Feature: gaming-hud-ui, Property 4: Health bar proportionality**
it('health bars are proportional to file sizes', () => {
  fc.assert(
    fc.property(
      fc.tuple(
        fc.integer({ min: 1, max: 1000 * 1024 * 1024 }), // file1 size
        fc.integer({ min: 1, max: 1000 * 1024 * 1024 })  // file2 size
      ),
      ([size1, size2]) => {
        const health1 = calculateHealthPercentage(size1);
        const health2 = calculateHealthPercentage(size2);
        
        if (size1 > size2) {
          expect(health1).toBeGreaterThanOrEqual(health2);
        } else if (size1 < size2) {
          expect(health1).toBeLessThanOrEqual(health2);
        } else {
          expect(health1).toBe(health2);
        }
      }
    ),
    { numRuns: 100 }
  );
});
```

### Visual Testing

- **Manual review**: Verify visual appearance matches design intent
- **Cross-browser testing**: Test in Chrome, Firefox, Edge
- **Performance testing**: Monitor frame rate during animations
- **Accessibility testing**: Verify text contrast ratios meet WCAG standards

### Integration Testing

- **End-to-end flow**: Scan → Classify → Display with gaming HUD
- **Button interactions**: Verify PURGE ENTITY and SAVE SOUL work correctly
- **Animation coordination**: Ensure CRT, fog, and button effects don't conflict

## Implementation Notes

### Performance Optimization

**CSS Animations**
- Use `transform` and `opacity` for GPU acceleration
- Avoid animating `width`, `height`, `top`, `left`
- Use `will-change` sparingly and only on actively animating elements

**Fog Layers**
- Limit to 3 layers maximum
- Use large blur radius (60px) for soft effect
- Position behind content with negative z-index

**CRT Overlay**
- Use CSS linear-gradient instead of image for scanlines
- Keep flicker animation subtle (opacity 0.97-1.0)
- Ensure pointer-events-none for click-through

### Accessibility Considerations

**Text Contrast**
- Verify all text meets WCAG AA standards (4.5:1 for normal text)
- Test with CRT overlay active
- Ensure health bar text is readable against background

**Motion Sensitivity**
- Keep flicker animation subtle to avoid triggering photosensitivity
- Consider adding `prefers-reduced-motion` media query support
- Provide option to disable animations (future enhancement)

**Font Readability**
- Creepster is decorative; use only for headers and monster names
- Use Rajdhani (clean, technical font) for all body text and controls
- Maintain adequate font sizes (minimum 14px for body text)

### Browser Compatibility

**Minimum Supported Versions**
- Chrome 90+
- Firefox 88+
- Edge 90+
- Safari 14+

**Fallback Strategies**
- Clip-path: Falls back to rectangular buttons
- Custom fonts: Falls back to system fonts
- Backdrop-filter: Falls back to solid backgrounds
- CSS animations: Gracefully degrades to static display

### Development Workflow

1. **Add Google Fonts**: Update index.html with font import
2. **Configure Tailwind**: Add font families to tailwind.config.js
3. **Implement CRT Overlay**: Add to App.tsx as fixed overlay
4. **Implement Fog Background**: Add to App.tsx behind content
5. **Transform MonsterCard**: Add enemy unit styling and health bar
6. **Transform Buttons**: Apply weapon trigger styling
7. **Apply Fonts**: Update all text elements with appropriate font classes
8. **Test and Refine**: Verify visual appearance and functionality

### File Modifications Required

- `index.html`: Add Google Fonts link
- `tailwind.config.js`: Add font family configuration
- `src/renderer/App.tsx`: Add CRT overlay and fog background
- `src/renderer/components/MonsterCard.tsx`: Transform to enemy unit card
- `src/renderer/components/ExorcismDashboard.tsx`: Apply gaming fonts
- `src/renderer/index.css`: Add custom CSS for CRT, fog, and button effects

