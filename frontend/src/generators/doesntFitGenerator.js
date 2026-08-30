/**
 * Doesn't Fit the Rule Generator (Cognizant / Capgemini Cognitive Assessment)
 * Generates anomaly and outlier detection challenges with progressive difficulty scaling across Levels 1-5.
 */

function shuffle(arr) {
  const array = [...arr];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// ─── PROGRESSIVE DIFFICULTY CHALLENGES PER LEVEL ───
const DOESNT_FIT_LEVEL_PATTERNS = {
  // ─── LEVEL 1: BEGINNER (Basic Count, Parity, Geometry & Angles) ───
  1: [
    {
      figures: [
        '▲ ▲ ▲ ▲ (4 Triangles)',
        '● ● ● ● (4 Circles)',
        '■ ■ ■ ■ (4 Squares)',
        '◆ ◆ ◆ (3 Diamonds)',
      ],
      outlier: '◆ ◆ ◆ (3 Diamonds)',
      reason: 'All standard options contain exactly 4 geometric shapes, while the outlier contains only 3 shapes.',
    },
    {
      figures: [
        '4-sided Quadrilateral (Square)',
        '4-sided Quadrilateral (Rectangle)',
        '4-sided Quadrilateral (Rhombus)',
        '5-sided Polygon (Pentagon)',
      ],
      outlier: '5-sided Polygon (Pentagon)',
      reason: 'All other figures are 4-sided quadrilaterals, whereas the outlier is a 5-sided pentagon.',
    },
    {
      figures: [
        'Arrow pointing Up-Right (↗ 45°)',
        'Arrow pointing Up-Right (↗ 45°)',
        'Arrow pointing Up-Right (↗ 45°)',
        'Arrow pointing Down-Right (↘ 135°)',
      ],
      outlier: 'Arrow pointing Down-Right (↘ 135°)',
      reason: 'Three figures share an identical upward-right 45° orientation, while the outlier points downward-right 135°.',
    },
    {
      figures: [
        'Even count: 2 Dots (● ●)',
        'Even count: 4 Dots (● ● ● ●)',
        'Even count: 6 Dots (● ● ● ● ● ●)',
        'Odd count: 5 Dots (● ● ● ● ●)',
      ],
      outlier: 'Odd count: 5 Dots (● ● ● ● ●)',
      reason: 'All other groups have an even dot count (2, 4, 6), whereas the outlier has an odd dot count (5).',
    },
    {
      figures: [
        '2 Concentric Circles (◎)',
        '2 Concentric Squares (回)',
        '2 Concentric Triangles (⟁)',
        '3 Concentric Circles (◎+)',
      ],
      outlier: '3 Concentric Circles (◎+)',
      reason: 'All figures contain exactly 2 concentric nested shapes except the outlier which has 3.',
    },
  ],

  // ─── LEVEL 2: ELEMENTARY (Symmetry, Shading & Closed/Open Topology) ───
  2: [
    {
      figures: [
        'Bilateral Vertical Symmetry (○ Circle)',
        'Bilateral Vertical Symmetry (△ Triangle)',
        'Bilateral Vertical Symmetry (□ Square)',
        'Asymmetric Shape (☈ Lightning)',
      ],
      outlier: 'Asymmetric Shape (☈ Lightning)',
      reason: 'All figures possess perfect bilateral vertical reflection symmetry except the outlier which is asymmetric.',
    },
    {
      figures: [
        '50% Shaded Area (Left Half)',
        '50% Shaded Area (Top Half)',
        '50% Shaded Area (Diagonal Split)',
        '25% Shaded Area (Single Quadrant)',
      ],
      outlier: '25% Shaded Area (Single Quadrant)',
      reason: 'All standard figures have exactly half (50%) of their total surface shaded, whereas the outlier is only 25% shaded.',
    },
    {
      figures: [
        'Closed Polygon (Hexagon ⬡)',
        'Closed Polygon (Octagon ⯃)',
        'Closed Polygon (Pentagon ⬠)',
        'Open Continuous Curve (S-Curve ᔕ)',
      ],
      outlier: 'Open Continuous Curve (S-Curve ᔕ)',
      reason: 'All other figures are closed planar polygons, while the outlier is an open curve.',
    },
    {
      figures: [
        'Exactly 2 Line Intersections (X + |)',
        'Exactly 2 Line Intersections (T + T)',
        'Exactly 2 Line Intersections (V + V cross)',
        '3 Line Intersections (Asterisk ✳)',
      ],
      outlier: '3 Line Intersections (Asterisk ✳)',
      reason: 'All standard figures contain exactly 2 intersection nodes, while the outlier has 3 intersection nodes.',
    },
    {
      figures: [
        '4 Right Angles (90° Square)',
        '4 Right Angles (90° Rectangle)',
        '4 Right Angles (90° L-Frame Grid)',
        '0 Right Angles (60° Equilateral Triangle)',
      ],
      outlier: '0 Right Angles (60° Equilateral Triangle)',
      reason: 'All other figures contain exactly 4 orthogonal 90° right angles, while the outlier has zero right angles.',
    },
  ],

  // ─── LEVEL 3: INTERMEDIATE (Relative Position, Dot Tracking & Color Order) ───
  3: [
    {
      figures: [
        'Internal Indicator Dot: Top-Right (↗)',
        'Internal Indicator Dot: Top-Right (↗)',
        'Internal Indicator Dot: Top-Right (↗)',
        'Internal Indicator Dot: Bottom-Left (↙)',
      ],
      outlier: 'Internal Indicator Dot: Bottom-Left (↙)',
      reason: 'Relative to the figure heading, all standard options place their indicator dot in the Top-Right quadrant, whereas the outlier is in the Bottom-Left.',
    },
    {
      figures: [
        'Circle strictly INSIDE Polygon (▲[●])',
        'Circle strictly INSIDE Polygon (■[●])',
        'Circle strictly INSIDE Polygon (⬡[●])',
        'Circle strictly OUTSIDE Polygon (▲ ●)',
      ],
      outlier: 'Circle strictly OUTSIDE Polygon (▲ ●)',
      reason: 'All standard options contain the circle inside the boundary of the larger polygon, whereas the outlier places the circle outside.',
    },
    {
      figures: [
        'Prime Side Count: 3 (Triangle)',
        'Prime Side Count: 5 (Pentagon)',
        'Prime Side Count: 7 (Heptagon)',
        'Composite Side Count: 6 (Hexagon)',
      ],
      outlier: 'Composite Side Count: 6 (Hexagon)',
      reason: 'The side counts of the standard figures are prime numbers (3, 5, 7), whereas 6 is a composite number.',
    },
    {
      figures: [
        'Clockwise Order: ▲ ➔ ● ➔ ■',
        'Clockwise Order: ● ➔ ■ ➔ ▲',
        'Clockwise Order: ■ ➔ ▲ ➔ ●',
        'Counter-Clockwise Order: ▲ ➔ ■ ➔ ●',
      ],
      outlier: 'Counter-Clockwise Order: ▲ ➔ ■ ➔ ●',
      reason: 'Three figures follow a strict Clockwise sequence (Triangle ➔ Circle ➔ Square), whereas the outlier follows a Counter-Clockwise sequence.',
    },
    {
      figures: [
        '2 Pairs of Parallel Lines (Parallelogram)',
        '2 Pairs of Parallel Lines (Rectangle)',
        '2 Pairs of Parallel Lines (Hexagon opposite sides)',
        '1 Pair of Parallel Lines (Trapezoid)',
      ],
      outlier: '1 Pair of Parallel Lines (Trapezoid)',
      reason: 'All other figures have 2 distinct pairs of parallel sides, whereas the trapezoid has only 1 pair of parallel sides.',
    },
  ],

  // ─── LEVEL 4: ADVANCED (Topological Genus, Chords & Dual Invariance) ───
  4: [
    {
      figures: [
        'Genus 1: 1 Enclosed Hole (Letter O)',
        'Genus 1: 1 Enclosed Hole (Letter D)',
        'Genus 1: 1 Enclosed Hole (Letter P)',
        'Genus 2: 2 Enclosed Holes (Letter B)',
      ],
      outlier: 'Genus 2: 2 Enclosed Holes (Letter B)',
      reason: 'Topologically, figures O, D, and P contain exactly 1 enclosed void (genus 1), whereas figure B contains 2 enclosed voids (genus 2).',
    },
    {
      figures: [
        'Shaded = Unshaded + 1 (3 Shaded, 2 Clear)',
        'Shaded = Unshaded + 1 (4 Shaded, 3 Clear)',
        'Shaded = Unshaded + 1 (5 Shaded, 4 Clear)',
        'Equal Count (3 Shaded, 3 Clear)',
      ],
      outlier: 'Equal Count (3 Shaded, 3 Clear)',
      reason: 'The governing invariant is (Shaded Count = Unshaded Count + 1). The outlier violates this with an equal count (3 vs 3).',
    },
    {
      figures: [
        'Right-Handed Spiral (Chirality: Clockwise inward)',
        'Right-Handed Spiral (Chirality: Clockwise inward)',
        'Right-Handed Spiral (Chirality: Clockwise inward)',
        'Left-Handed Spiral (Chirality: Counter-Clockwise inward)',
      ],
      outlier: 'Left-Handed Spiral (Chirality: Counter-Clockwise inward)',
      reason: 'All standard figures are right-handed chiral spirals; the outlier is a non-superimposable left-handed chiral mirror.',
    },
    {
      figures: [
        'Internal Chords = Sides - 1 (3 sides, 2 chords)',
        'Internal Chords = Sides - 1 (4 sides, 3 chords)',
        'Internal Chords = Sides - 1 (5 sides, 4 chords)',
        'Internal Chords = Sides (4 sides, 4 chords)',
      ],
      outlier: 'Internal Chords = Sides (4 sides, 4 chords)',
      reason: 'All standard figures maintain (Chords = Sides - 1). The outlier violates this rule with equal chords to sides.',
    },
    {
      figures: [
        '+45° Rotation Step (45° ➔ 90° ➔ 135°)',
        '+45° Rotation Step (90° ➔ 135° ➔ 180°)',
        '+45° Rotation Step (180° ➔ 225° ➔ 270°)',
        '+90° Rotation Step (0° ➔ 90° ➔ 180°)',
      ],
      outlier: '+90° Rotation Step (0° ➔ 90° ➔ 180°)',
      reason: 'The standard figures advance in arithmetic rotational increments of +45°, while the outlier advances in +90° jumps.',
    },
  ],

  // ─── LEVEL 5: MASTER (Combinatorial Conservation & Cross-Modular Parity) ───
  5: [
    {
      figures: [
        'Conservation Sum: Sides (4) + Dots (4) = 8',
        'Conservation Sum: Sides (5) + Dots (3) = 8',
        'Conservation Sum: Sides (6) + Dots (2) = 8',
        'Conservation Sum: Sides (5) + Dots (4) = 9',
      ],
      outlier: 'Conservation Sum: Sides (5) + Dots (4) = 9',
      reason: 'All standard figures conserve the exact invariant (Sides + Internal Dots = 8). The outlier sums to 9.',
    },
    {
      figures: [
        'Eulerian Path Traversible (Even Degree Vertices)',
        'Eulerian Path Traversible (Even Degree Vertices)',
        'Eulerian Path Traversible (Even Degree Vertices)',
        'Non-Eulerian (4 Odd Degree Vertices - Cannot trace without lifting pen)',
      ],
      outlier: 'Non-Eulerian (4 Odd Degree Vertices - Cannot trace without lifting pen)',
      reason: 'All other figures are unicursal Eulerian planar graphs traversable in a single continuous stroke; the outlier has 4 odd-degree vertices.',
    },
    {
      figures: [
        'Dual Operation: 90° CW Rotation AND Inverted Shading',
        'Dual Operation: 90° CW Rotation AND Inverted Shading',
        'Dual Operation: 90° CW Rotation AND Inverted Shading',
        'Single Operation: 90° CW Rotation WITHOUT Shading Inversion',
      ],
      outlier: 'Single Operation: 90° CW Rotation WITHOUT Shading Inversion',
      reason: 'The standard figures undergo compound transformation (90° CW rotation + color inversion), whereas the outlier only rotates without inverting colors.',
    },
    {
      figures: [
        'Cross-Modular Parity: (Rows × Cols) mod 2 = 0 [2×3=6]',
        'Cross-Modular Parity: (Rows × Cols) mod 2 = 0 [4×2=8]',
        'Cross-Modular Parity: (Rows × Cols) mod 2 = 0 [2×5=10]',
        'Odd Modular Parity: (Rows × Cols) mod 2 = 1 [3×3=9]',
      ],
      outlier: 'Odd Modular Parity: (Rows × Cols) mod 2 = 1 [3×3=9]',
      reason: 'The standard matrices all maintain an even area parity (mod 2 = 0), while the outlier has odd area parity (3×3 = 9).',
    },
    {
      figures: [
        'Orthogonal Perpendicular System (All angles = 90°/180°)',
        'Orthogonal Perpendicular System (All angles = 90°/180°)',
        'Orthogonal Perpendicular System (All angles = 90°/180°)',
        'Non-Orthogonal Skew System (Contains 30° / 60° acute lines)',
      ],
      outlier: 'Non-Orthogonal Skew System (Contains 30° / 60° acute lines)',
      reason: 'All other systems are strictly orthogonal with perpendicular coordinates, while the outlier contains non-orthogonal skew vectors.',
    },
  ],
};

export function generateDoesntFitPuzzle(levelConfig = {}) {
  const levelNum = Math.max(1, Math.min(5, levelConfig.levelNumber || 1));
  const roundIdx = Math.max(0, (levelConfig.round || 1) - 1);

  const levelPatterns = DOESNT_FIT_LEVEL_PATTERNS[levelNum] || DOESNT_FIT_LEVEL_PATTERNS[1];
  const selectedPattern = levelPatterns[roundIdx % levelPatterns.length] || levelPatterns[0];

  return {
    question: 'Identify the figure that DOES NOT fit the common rule:',
    levelNumber: levelNum,
    options: shuffle([...selectedPattern.figures]),
    correctAnswer: selectedPattern.outlier,
    explanation: selectedPattern.reason,
  };
}
