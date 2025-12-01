import { render, screen, within } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/extend-expect';
import Header from '../components/Header.svelte';

describe('Header Component Tests', () => {
  it('renders without errors', () => {
    const container = document.createElement('div');
    render(Header, { target: container });
    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
  });

  it('has accessible navigation', () => {
    const container = document.createElement('div');
    render(Header, { target: container });
    const header = screen.getByRole('navigation');
    const links = within(header).getAllByRole('link');
    expect(links).toHaveLength(3);
    expect(links[0].hasAttribute('aria-label', 'Home');
  });

  it('includes logo with proper alt text', () => {
    const container = document.createElement('div');
    render(Header, { target: container });
    const logo = screen.getByAltText('Logo');
    expect(logo).toBeInTheDocument();
  });
});