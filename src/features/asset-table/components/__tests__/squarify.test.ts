import { squarify } from '../MarketTreemap';

describe('squarify treemap layout algorithm', () => {
  it('returns empty array when items list is empty', () => {
    const rects = squarify(0, 0, 800, 600, []);
    expect(rects).toEqual([]);
  });

  it('returns empty array when container dimensions are 0 or less', () => {
    const items = [{ id: 'BTC', weight: 10 }];
    expect(squarify(0, 0, 0, 600, items)).toEqual([]);
    expect(squarify(0, 0, 800, -100, items)).toEqual([]);
  });

  it('returns empty array when total items weight is 0', () => {
    const items = [{ id: 'BTC', weight: 0 }, { id: 'ETH', weight: 0 }];
    expect(squarify(0, 0, 800, 600, items)).toEqual([]);
  });

  it('positions a single item to fill the entire container boundary', () => {
    const items = [{ id: 'BTC', weight: 100 }];
    const rects = squarify(10, 20, 800, 600, items);
    
    expect(rects).toHaveLength(1);
    expect(rects[0]).toEqual({
      id: 'BTC',
      x: 10,
      y: 20,
      width: 800,
      height: 600
    });
  });

  it('correctly segments multiple items descending by weight', () => {
    const items = [
      { id: 'ETH', weight: 25 },
      { id: 'BTC', weight: 50 },
      { id: 'BNB', weight: 25 }
    ];
    // Total weight = 100
    // Container area = 800 * 600 = 480,000
    // BTC weight = 50% -> Area = 240,000
    // ETH weight = 25% -> Area = 120,000
    // BNB weight = 25% -> Area = 120,000
    
    const rects = squarify(0, 0, 800, 600, items);
    expect(rects).toHaveLength(3);

    // Verify ordering is based on sorted weight (descending)
    expect(rects[0].id).toBe('BTC');
    expect(rects[1].id).toBe('ETH');
    expect(rects[2].id).toBe('BNB');

    // Total area of the resulting rects must equal the container area
    const totalArea = rects.reduce((sum, r) => sum + r.width * r.height, 0);
    expect(totalArea).toBeCloseTo(800 * 600, 2);

    // Check bounds: no x/y coordinates should extend past the container limit
    for (const r of rects) {
      expect(r.x).toBeGreaterThanOrEqual(0);
      expect(r.y).toBeGreaterThanOrEqual(0);
      expect(r.x + r.width).toBeLessThanOrEqual(800);
      expect(r.y + r.height).toBeLessThanOrEqual(600);
    }
  });

  it('generates non-overlapping coordinates', () => {
    const items = [
      { id: 'A', weight: 10 },
      { id: 'B', weight: 8 },
      { id: 'C', weight: 6 },
      { id: 'D', weight: 4 },
      { id: 'E', weight: 2 }
    ];
    
    const rects = squarify(0, 0, 1000, 1000, items);
    
    // Validate that no two rectangles overlap
    for (let i = 0; i < rects.length; i++) {
      for (let j = i + 1; j < rects.length; j++) {
        const r1 = rects[i];
        const r2 = rects[j];
        
        const horizontalOverlap = Math.max(0, Math.min(r1.x + r1.width, r2.x + r2.width) - Math.max(r1.x, r2.x));
        const verticalOverlap = Math.max(0, Math.min(r1.y + r1.height, r2.y + r2.height) - Math.max(r1.y, r2.y));
        const hasOverlap = horizontalOverlap > 0.01 && verticalOverlap > 0.01;
        
        expect(hasOverlap).toBeFalsy();
      }
    }
  });
});
