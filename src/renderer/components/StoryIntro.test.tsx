import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import StoryIntro from './StoryIntro';

/**
 * Unit tests for StoryIntro component
 * 
 * Tests verify:
 * - Component renders title and narrative text
 * - onStart callback is called when button is clicked
 */

describe('StoryIntro', () => {
  describe('Rendering', () => {
    it('renders the story intro container', () => {
      render(<StoryIntro onStart={() => {}} />);
      
      const container = screen.getByTestId('story-intro');
      expect(container).toBeTruthy();
    });

    it('renders "The Ritual Begins" title', () => {
      render(<StoryIntro onStart={() => {}} />);
      
      const title = screen.getByTestId('story-intro-title');
      expect(title).toBeTruthy();
      expect(title.textContent).toBe('The Ritual Begins');
    });

    it('renders narrative text section', () => {
      render(<StoryIntro onStart={() => {}} />);
      
      const narrative = screen.getByTestId('story-intro-narrative');
      expect(narrative).toBeTruthy();
    });

    it('renders narrative content about digital spirits', () => {
      render(<StoryIntro onStart={() => {}} />);
      
      expect(screen.getByText(/digital spirits/i)).toBeTruthy();
      expect(screen.getByText(/Digital Exorcist/i)).toBeTruthy();
    });

    it('renders the "Begin the Ritual" button', () => {
      render(<StoryIntro onStart={() => {}} />);
      
      const button = screen.getByTestId('story-intro-button');
      expect(button).toBeTruthy();
      expect(button.textContent).toBe('Begin the Ritual');
    });

    it('applies custom className when provided', () => {
      render(<StoryIntro onStart={() => {}} className="custom-class" />);
      
      const container = screen.getByTestId('story-intro');
      expect(container.className).toContain('custom-class');
    });
  });

  describe('Interactions', () => {
    it('calls onStart when button is clicked', () => {
      const mockOnStart = vi.fn();
      render(<StoryIntro onStart={mockOnStart} />);
      
      const button = screen.getByTestId('story-intro-button');
      fireEvent.click(button);
      
      expect(mockOnStart).toHaveBeenCalledTimes(1);
    });

    it('calls onStart each time button is clicked', () => {
      const mockOnStart = vi.fn();
      render(<StoryIntro onStart={mockOnStart} />);
      
      const button = screen.getByTestId('story-intro-button');
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
      
      expect(mockOnStart).toHaveBeenCalledTimes(3);
    });
  });
});
