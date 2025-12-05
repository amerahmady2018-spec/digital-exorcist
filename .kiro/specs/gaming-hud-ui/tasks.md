# Implementation Plan

- [x] 1. Configure gaming fonts
  - Add Google Fonts import to index.html for Creepster and Rajdhani
  - Update tailwind.config.js to add font-creepster and font-tech font families
  - Verify fonts load correctly in browser
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 1.1 Write property test for font application to headers
  - **Property 11: Font application consistency**
  - **Validates: Requirements 1.2, 6.1**

- [x] 1.2 Write property test for font application to UI text
  - **Property 12: Font application consistency for UI**
  - **Validates: Requirements 1.3, 6.1**

- [x] 2. Implement CRT overlay effect
  - Add fixed full-screen overlay div to App.tsx with pointer-events-none
  - Create CSS for scanline effect using repeating linear-gradient
  - Implement subtle flicker animation with keyframes
  - Set appropriate z-index to layer above content
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 2.1 Write property test for CRT overlay non-interference
  - **Property 2: CRT overlay non-interference**
  - **Validates: Requirements 2.4**

- [x] 3. Implement animated fog background
  - Add fixed background container to App.tsx with negative z-index
  - Create 3 fog layer divs with radial gradients
  - Implement CSS keyframe animations for each fog layer (30s, 40s, 50s)
  - Apply blur filter and ensure smooth GPU-accelerated transforms
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 3.1 Write property test for fog layer independence
  - **Property 10: Fog layer independence**
  - **Validates: Requirements 3.4**

- [x] 3.2 Write property test for content visibility above fog
  - **Property 3: Readability preservation**
  - **Validates: Requirements 2.5, 3.5**

- [x] 4. Transform MonsterCard to enemy unit card
  - Apply jagged neon border (border-2 border-red-600) with glowing shadow
  - Update monster name to use font-creepster
  - Remove rounded corners for sharp, aggressive styling
  - Enhance visual contrast and game-like appearance
  - _Requirements: 4.1, 4.2, 4.6_

- [x] 4.1 Write property test for enemy unit card styling
  - **Property 1: Font loading fallback**
  - **Validates: Requirements 1.5**

- [x] 5. Implement health bar visualization
  - Add health bar container at bottom of MonsterCard
  - Calculate health percentage based on file size (500MB = 100%)
  - Render visual bar with red gradient scaled to health percentage
  - Display numeric file size alongside visual bar
  - Ensure consistent scaling across all cards
  - _Requirements: 4.3, 4.4, 4.5, 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 5.1 Write property test for health bar proportionality
  - **Property 4: Health bar proportionality**
  - **Validates: Requirements 7.1, 7.5**

- [x] 5.2 Write property test for health bar maximum scale
  - **Property 5: Health bar maximum scale**
  - **Validates: Requirements 7.2**

- [x] 5.3 Write property test for health bar minimum scale
  - **Property 6: Health bar minimum scale**
  - **Validates: Requirements 7.3**

- [x] 5.4 Write property test for health bar data completeness
  - **Property 7: Health bar data completeness**
  - **Validates: Requirements 7.4**

- [x] 6. Transform action buttons to weapon triggers
  - Change "Banish" button label to "[ PURGE ENTITY ]" in uppercase
  - Change "Resurrect" button label to "[ SAVE SOUL ]" in uppercase
  - Apply clip-path for clipped corners (8px clips on opposite corners)
  - Add glowing text effect with multiple text-shadow layers
  - Add glowing border effect with box-shadow
  - Implement shake animation on hover
  - Apply to all action buttons in MonsterCard and other components
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.5_

- [x] 6.1 Write property test for button label transformation
  - **Property 8: Button label transformation**
  - **Validates: Requirements 5.1, 5.2**

- [x] 6.2 Write property test for button hover effects
  - **Property 9: Animation smoothness**
  - **Validates: Requirements 8.4**

- [x] 7. Apply gaming fonts across all components
  - Update App.tsx header to use font-creepster
  - Update ExorcismDashboard headers to use font-creepster
  - Update all UI text and controls to use font-tech
  - Ensure consistent font weights (500 for body, 700 for bold)
  - _Requirements: 1.2, 1.3, 6.1_

- [x] 8. Create custom CSS file for gaming effects
  - Create src/renderer/gaming-hud.css for CRT, fog, and button styles
  - Define .crt-overlay class with scanline gradient and flicker animation
  - Define .fog-background and .fog-layer classes with drift animations
  - Define .weapon-trigger-btn class with clip-path and glow effects
  - Define @keyframes for crt-flicker, fog-drift-1/2/3, and button-shake
  - Import gaming-hud.css in App.tsx or index.css
  - _Requirements: 2.2, 2.3, 3.2, 5.3, 5.4, 5.5_

- [x] 9. Checkpoint - Verify visual appearance and functionality
  - Ensure all tests pass, ask the user if questions arise
  - Manually verify CRT overlay, fog background, and fonts display correctly
  - Test button interactions and animations
  - Verify health bars scale correctly for different file sizes
  - Confirm existing functionality (scan, banish, resurrect) still works

- [x] 9.1 Write property test for functionality preservation
  - **Property 13: Functionality preservation**
  - **Validates: Requirements 6.6**

- [x] 10. Polish and optimize
  - Add will-change CSS property to animated elements for performance
  - Verify text contrast meets WCAG AA standards with effects active
  - Test cross-browser compatibility (Chrome, Firefox, Edge)
  - Ensure responsive behavior on different screen sizes
  - _Requirements: 8.1, 8.2, 8.3_

- [x] 11. Final checkpoint - Complete testing and user review
  - Ensure all tests pass, ask the user if questions arise
  - Verify all requirements are met
  - Confirm gaming HUD transformation is complete and polished
