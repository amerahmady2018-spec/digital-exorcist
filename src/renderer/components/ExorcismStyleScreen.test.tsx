import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ExorcismStyleScreen from './ExorcismStyleScreen';
import { AppState } from '../store/appStore';

// Mock the app store
const mockTransition = vi.fn();
vi.mock('../store/appStore', async () => {
  const actual = await vi.importActual('../store/appStore');
  return {
    ...actual,
    useAppStore: () => ({
      transition: mockTransition,
    }),
  };
});

/**
 * Integration tests for ExorcismStyleScreen
 * 
 * Tests story mode entry point.
 * Requirements: 1.1, 1.2
 */

describe('ExorcismStyleScreen', () => {
  beforeEach(() => {
    mockTransition.mockClear();
  });

  it('renders the style selection screen', () => {
    render(<ExorcismStyleScreen />);
    
    expect(screen.getByText('Choose Your Path')).toBeTruthy();
  });

  it('renders Story mode option with correct label', () => {
    render(<ExorcismStyleScreen />);
    
    expect(screen.getByText('Story')).toBeTruthy();
    expect(screen.getByText('Guided Ritual')).toBeTruthy();
  });

  it('clicking Story mode transitions to STORY_MODE state', async () => {
    render(<ExorcismStyleScreen />);
    
    // Find and click the Story mode card
    const storyCard = screen.getByText('Guided Ritual').closest('button');
    expect(storyCard).toBeTruthy();
    
    fireEvent.click(storyCard!);
    
    // Wait for the setTimeout in handleSelectStyle
    await new Promise(resolve => setTimeout(resolve, 250));
    
    expect(mockTransition).toHaveBeenCalledWith(AppState.STORY_MODE);
  });

  it('renders Swift Purge option', () => {
    render(<ExorcismStyleScreen />);
    
    expect(screen.getByText('Tool')).toBeTruthy();
    expect(screen.getByText('Swift Purge')).toBeTruthy();
  });

  it('renders Confrontation option', () => {
    render(<ExorcismStyleScreen />);
    
    expect(screen.getByText('Interactive')).toBeTruthy();
    expect(screen.getByText('Confrontation')).toBeTruthy();
  });
});
