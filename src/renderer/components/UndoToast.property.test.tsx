import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, waitFor, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import { UndoToast } from './UndoToast';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('UndoToast Property-Based Tests', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  /**
   * **Feature: premium-exorcist-transformation, Property 24: Undo toast display**
   * **Validates: Requirements 13.1**
   * 
   * For any file banishment, an undo toast should be displayed immediately 
   * after the operation completes.
   */
  it('Property 24: Undo toast display', () => {
    fc.assert(
      fc.property(
        // Generate arbitrary undo IDs
        fc.string({ minLength: 1, maxLength: 50 }),
        // Generate arbitrary file names
        fc.string({ minLength: 1, maxLength: 100 }),
        (undoId, fileName) => {
          const mockOnUndo = vi.fn().mockResolvedValue(undefined);
          const mockOnDismiss = vi.fn();

          // Render the UndoToast component
          const { container, unmount } = render(
            <UndoToast
              undoId={undoId}
              fileName={fileName}
              onUndo={mockOnUndo}
              onDismiss={mockOnDismiss}
              duration={5000}
            />
          );

          // Verify the toast is displayed in the DOM
          const toastElement = container.querySelector('[data-testid="undo-toast"]');
          expect(toastElement).toBeTruthy();

          // Verify the file name is displayed
          expect(container.textContent).toContain(fileName);

          // Verify the "UNDO SPELL" button is present
          const undoButton = container.querySelector('button');
          expect(undoButton).toBeTruthy();
          expect(undoButton?.textContent).toContain('UNDO SPELL');

          // Verify the toast has the correct structure
          expect(container.textContent).toContain('FILE BANISHED');

          // Clean up after each test iteration
          unmount();

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: premium-exorcist-transformation, Property 25: Undo toast auto-dismiss timing**
   * **Validates: Requirements 13.2**
   * 
   * For any undo toast, it should be automatically dismissed after 5 seconds 
   * if not interacted with.
   */
  it('Property 25: Undo toast auto-dismiss timing', () => {
    fc.assert(
      fc.property(
        // Generate arbitrary undo IDs
        fc.string({ minLength: 1, maxLength: 50 }),
        // Generate arbitrary file names
        fc.string({ minLength: 1, maxLength: 100 }),
        // Generate arbitrary durations between 1000ms and 10000ms
        fc.integer({ min: 1000, max: 10000 }),
        (undoId, fileName, duration) => {
          const mockOnUndo = vi.fn().mockResolvedValue(undefined);
          const mockOnDismiss = vi.fn();

          // Render the UndoToast component with the specified duration
          const { container, unmount } = render(
            <UndoToast
              undoId={undoId}
              fileName={fileName}
              onUndo={mockOnUndo}
              onDismiss={mockOnDismiss}
              duration={duration}
            />
          );

          // Verify the toast is initially visible
          let toastElement = container.querySelector('[data-testid="undo-toast"]');
          expect(toastElement).toBeTruthy();

          // Advance time to just before the duration
          act(() => {
            vi.advanceTimersByTime(duration - 100);
          });

          // Toast should still be visible
          toastElement = container.querySelector('[data-testid="undo-toast"]');
          expect(toastElement).toBeTruthy();

          // Advance time past the duration
          act(() => {
            vi.advanceTimersByTime(200);
          });

          // Wait for the fade-out animation delay (300ms)
          act(() => {
            vi.advanceTimersByTime(400);
          });

          // onDismiss should have been called
          expect(mockOnDismiss).toHaveBeenCalled();

          // Clean up after each test iteration
          unmount();

          return true;
        }
      ),
      { numRuns: 50 } // Reduced runs due to timer complexity
    );
  });

  /**
   * Additional property test: Countdown timer accuracy
   * 
   * For any duration, the countdown timer should accurately reflect 
   * the remaining time.
   */
  it('Property: Countdown timer shows correct remaining seconds', () => {
    fc.assert(
      fc.property(
        // Generate arbitrary undo IDs
        fc.string({ minLength: 1, maxLength: 50 }),
        // Generate arbitrary file names
        fc.string({ minLength: 1, maxLength: 100 }),
        // Generate durations that are multiples of 1000 for easier testing
        fc.integer({ min: 1, max: 10 }).map(n => n * 1000),
        (undoId, fileName, duration) => {
          const mockOnUndo = vi.fn().mockResolvedValue(undefined);
          const mockOnDismiss = vi.fn();

          // Render the UndoToast component
          const { container, unmount } = render(
            <UndoToast
              undoId={undoId}
              fileName={fileName}
              onUndo={mockOnUndo}
              onDismiss={mockOnDismiss}
              duration={duration}
            />
          );

          // Initial countdown should show the full duration in seconds
          const expectedInitialSeconds = Math.ceil(duration / 1000);
          expect(container.textContent).toContain(`${expectedInitialSeconds}s`);

          // Advance time by 1 second
          act(() => {
            vi.advanceTimersByTime(1000);
          });

          // Countdown should decrease by 1
          const expectedAfterOneSecond = Math.max(0, expectedInitialSeconds - 1);
          if (expectedAfterOneSecond > 0) {
            expect(container.textContent).toContain(`${expectedAfterOneSecond}s`);
          }

          // Clean up after each test iteration
          unmount();

          return true;
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Additional property test: Undo button click triggers callback
   * 
   * For any undo toast, clicking the undo button should trigger the onUndo callback
   * with the correct undoId.
   */
  it('Property: Undo button click triggers callback with correct ID', async () => {
    // Use real timers for this test since we're testing user interaction
    vi.useRealTimers();

    await fc.assert(
      fc.asyncProperty(
        // Generate arbitrary undo IDs
        fc.string({ minLength: 1, maxLength: 50 }),
        // Generate arbitrary file names
        fc.string({ minLength: 1, maxLength: 100 }),
        async (undoId, fileName) => {
          const mockOnUndo = vi.fn().mockResolvedValue(undefined);
          const mockOnDismiss = vi.fn();

          // Render the UndoToast component
          const { container, unmount } = render(
            <UndoToast
              undoId={undoId}
              fileName={fileName}
              onUndo={mockOnUndo}
              onDismiss={mockOnDismiss}
              duration={5000}
            />
          );

          // Find and click the undo button
          const undoButton = container.querySelector('button');
          expect(undoButton).toBeTruthy();

          if (undoButton) {
            fireEvent.click(undoButton);
          }

          // Wait for the async operation
          await new Promise(resolve => setTimeout(resolve, 10));

          // Verify onUndo was called with the correct undoId
          expect(mockOnUndo).toHaveBeenCalledWith(undoId);

          // Clean up after each test iteration
          unmount();

          return true;
        }
      ),
      { numRuns: 50 }
    );

    // Restore fake timers for other tests
    vi.useFakeTimers();
  });

  /**
   * Additional property test: Button disabled during undo operation
   * 
   * For any undo toast, the button should be disabled while the undo operation
   * is in progress to prevent double-clicks.
   */
  it('Property: Button shows loading state during undo', async () => {
    // Use real timers for this test
    vi.useRealTimers();

    await fc.assert(
      fc.asyncProperty(
        // Generate arbitrary undo IDs
        fc.string({ minLength: 1, maxLength: 50 }),
        // Generate arbitrary file names
        fc.string({ minLength: 1, maxLength: 100 }),
        async (undoId, fileName) => {
          // Create a promise that we can control
          let resolveUndo: () => void;
          const undoPromise = new Promise<void>((resolve) => {
            resolveUndo = resolve;
          });
          const mockOnUndo = vi.fn().mockReturnValue(undoPromise);
          const mockOnDismiss = vi.fn();

          // Render the UndoToast component
          const { container, unmount } = render(
            <UndoToast
              undoId={undoId}
              fileName={fileName}
              onUndo={mockOnUndo}
              onDismiss={mockOnDismiss}
              duration={10000} // Long duration to prevent auto-dismiss
            />
          );

          // Find and click the undo button
          const undoButton = container.querySelector('button') as HTMLButtonElement;
          expect(undoButton).toBeTruthy();

          // Click the button
          fireEvent.click(undoButton);

          // Wait a tick for state update
          await new Promise(resolve => setTimeout(resolve, 10));

          // Button should now be disabled
          expect(undoButton.disabled).toBe(true);

          // Button text should show loading state
          expect(undoButton.textContent).toContain('REVERSING SPELL');

          // Resolve the undo promise
          resolveUndo!();

          // Clean up after each test iteration
          unmount();

          return true;
        }
      ),
      { numRuns: 30 }
    );

    // Restore fake timers
    vi.useFakeTimers();
  });
});

describe('UndoToast Unit Tests', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders with correct initial state', () => {
    const mockOnUndo = vi.fn().mockResolvedValue(undefined);
    const mockOnDismiss = vi.fn();

    const { container } = render(
      <UndoToast
        undoId="test-id"
        fileName="test-file.txt"
        onUndo={mockOnUndo}
        onDismiss={mockOnDismiss}
        duration={5000}
      />
    );

    // Verify toast is rendered
    expect(container.querySelector('[data-testid="undo-toast"]')).toBeTruthy();
    
    // Verify file name is displayed
    expect(container.textContent).toContain('test-file.txt');
    
    // Verify countdown shows 5 seconds
    expect(container.textContent).toContain('5s');
  });

  it('auto-dismisses after duration', () => {
    const mockOnUndo = vi.fn().mockResolvedValue(undefined);
    const mockOnDismiss = vi.fn();

    render(
      <UndoToast
        undoId="test-id"
        fileName="test-file.txt"
        onUndo={mockOnUndo}
        onDismiss={mockOnDismiss}
        duration={5000}
      />
    );

    // Advance past duration (5000ms) + fade-out animation delay (300ms) + buffer
    act(() => {
      vi.advanceTimersByTime(5100); // Past duration
    });
    
    act(() => {
      vi.advanceTimersByTime(400); // Past fade-out animation
    });

    expect(mockOnDismiss).toHaveBeenCalled();
  });

  it('does not call onDismiss before duration expires', () => {
    const mockOnUndo = vi.fn().mockResolvedValue(undefined);
    const mockOnDismiss = vi.fn();

    render(
      <UndoToast
        undoId="test-id"
        fileName="test-file.txt"
        onUndo={mockOnUndo}
        onDismiss={mockOnDismiss}
        duration={5000}
      />
    );

    // Advance to just before duration
    act(() => {
      vi.advanceTimersByTime(4900);
    });

    expect(mockOnDismiss).not.toHaveBeenCalled();
  });
});
