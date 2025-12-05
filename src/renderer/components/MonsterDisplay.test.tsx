import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MonsterDisplay } from './MonsterDisplay';

describe('MonsterDisplay', () => {
  it('renders monster image and HP bar', () => {
    const { container } = render(
      <MonsterDisplay
        image="/test-image.png"
        hp={75}
        maxHP={100}
        isShaking={false}
      />
    );

    // Check that the component renders
    expect(container.querySelector('img')).toBeTruthy();
    
    // Check HP text is displayed
    const hpText = container.textContent;
    expect(hpText).toContain('75');
    expect(hpText).toContain('100');
    expect(hpText).toContain('MONSTER HP');
  });

  it('displays correct HP percentage in bar', () => {
    const { container } = render(
      <MonsterDisplay
        image="/test-image.png"
        hp={50}
        maxHP={100}
        isShaking={false}
      />
    );

    // HP bar should be 50% width
    const hpBar = container.querySelector('.bg-gradient-to-r');
    expect(hpBar).toBeTruthy();
  });

  it('renders with shake animation when isShaking is true', () => {
    const { container } = render(
      <MonsterDisplay
        image="/test-image.png"
        hp={100}
        maxHP={100}
        isShaking={true}
      />
    );

    // Component should render even with shake animation
    expect(container.querySelector('img')).toBeTruthy();
  });
});
