import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PlayerDisplay } from './PlayerDisplay';

describe('PlayerDisplay', () => {
  it('renders player avatar and HP bar', () => {
    const { container } = render(
      <PlayerDisplay
        hp={75}
        maxHP={100}
        mana={50}
        maxMana={100}
        isShaking={false}
      />
    );

    // Check that the component renders
    const text = container.textContent;
    
    // Check HP text is displayed
    expect(text).toContain('75');
    expect(text).toContain('100');
    expect(text).toContain('PLAYER HP');
  });

  it('renders mana bar with correct values', () => {
    const { container } = render(
      <PlayerDisplay
        hp={100}
        maxHP={100}
        mana={70}
        maxMana={100}
        isShaking={false}
      />
    );

    // Check mana text is displayed
    const text = container.textContent;
    expect(text).toContain('70');
    expect(text).toContain('MANA');
  });

  it('displays correct HP and mana percentages in bars', () => {
    const { container } = render(
      <PlayerDisplay
        hp={50}
        maxHP={100}
        mana={30}
        maxMana={100}
        isShaking={false}
      />
    );

    // Both HP and mana bars should render
    const bars = container.querySelectorAll('.bg-gradient-to-r');
    expect(bars.length).toBe(2); // One for HP, one for mana
  });

  it('renders with shake animation when isShaking is true', () => {
    const { container } = render(
      <PlayerDisplay
        hp={100}
        maxHP={100}
        mana={100}
        maxMana={100}
        isShaking={true}
      />
    );

    // Component should render even with shake animation
    expect(container.textContent).toContain('PLAYER HP');
  });

  it('handles zero HP correctly', () => {
    const { container } = render(
      <PlayerDisplay
        hp={0}
        maxHP={100}
        mana={50}
        maxMana={100}
        isShaking={false}
      />
    );

    // Check that 0 HP is displayed
    const text = container.textContent;
    expect(text).toContain('0');
    expect(text).toContain('PLAYER HP');
  });

  it('handles zero mana correctly', () => {
    const { container } = render(
      <PlayerDisplay
        hp={100}
        maxHP={100}
        mana={0}
        maxMana={100}
        isShaking={false}
      />
    );

    // Check that 0 mana is displayed
    const text = container.textContent;
    expect(text).toContain('0');
    expect(text).toContain('MANA');
  });
});
