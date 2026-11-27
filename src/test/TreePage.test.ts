import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { treeStyles } from '../features/family-tree/components/templates/treeTemplateGallery';
import { TreeTemplateGallery } from '../features/family-tree/components/templates/treeTemplateGallery';

afterEach(cleanup);

describe('TreeStyle Gallery', () => {
  it('should have 8 available styles', () => {
    expect(treeStyles).toHaveLength(8);
  });

  it('each style should have required properties', () => {
    treeStyles.forEach((style) => {
      expect(style).toHaveProperty('id');
      expect(style).toHaveProperty('name');
      expect(style).toHaveProperty('description');
      expect(style).toHaveProperty('icon');
      expect(style).toHaveProperty('colorPrimary');
      expect(style).toHaveProperty('colorSecondary');
      expect(style).toHaveProperty('cardShape');
      expect(style).toHaveProperty('spacing');
      expect(style).toHaveProperty('orientation');
    });
  });

  it('styles should have valid orientation values', () => {
    const validOrientations = ['vertical', 'horizontal', 'radial'];
    treeStyles.forEach((style) => {
      expect(validOrientations).toContain(style.orientation);
    });
  });

  it('styles should have valid cardShape values', () => {
    const validCardShapes = ['round', 'square'];
    treeStyles.forEach((style) => {
      expect(validCardShapes).toContain(style.cardShape);
    });
  });

  it('styles should have valid spacing values', () => {
    const validSpacing = ['compact', 'normal', 'wide'];
    treeStyles.forEach((style) => {
      expect(validSpacing).toContain(style.spacing);
    });
  });

  it('notifies when the user selects a style', () => {
    const onStyleSelect = vi.fn();
    render(React.createElement(TreeTemplateGallery, {
      currentStyle: 'classic',
      onStyleSelect,
    }));

    fireEvent.click(screen.getByRole('menuitemradio', { name: 'Seleccionar estilo Horizontal' }));

    expect(onStyleSelect).toHaveBeenCalledWith('horizontal');
  });
});