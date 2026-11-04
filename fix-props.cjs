const fs = require('fs');
const files = [
  'src/features/home/components/FeaturedTree.tsx',
  'src/features/home/components/RecentActivity.tsx',
  'src/features/home/components/FeaturedMemories.tsx',
  'src/features/home/Home.tsx',
  'src/features/person/components/PersonHeader.tsx',
  'src/features/person/components/BiographySection.tsx',
  'src/features/person/components/FamilySection.tsx',
  'src/features/person/components/TimelineSection.tsx',
  'src/features/person/components/GallerySection.tsx',
  'src/features/person/components/DocumentsSection.tsx',
  'src/features/person/PersonProfilePage.tsx',
  'src/features/tree/components/TreeNode.tsx',
  'src/features/tree/components/ConnectionLine.tsx',
  'src/features/tree/components/EmotionalTree.tsx',
];
for (const f of files) {
  let c = fs.readFileSync(f, 'utf8');
  // Add className?: string; before the closing of each Props interface
  // Pattern: find "export interface XXXProps {" ... "}\n" and add className inside
  // Simplest: replace "}\n" that closes Props interface - but too risky
  // Instead, add className to destructure defaults (already there) and add to interface by regex
  // Match: interface FooProps { ... }  -> insert className?: string; before last }
  const match = c.match(/(export interface \w+Props \{[\s\S]*?)(\n\})/);
  if (match) {
    const before = match[1];
    const after = match[2];
    if (!before.includes('className')) {
      c = c.replace(match[0], before + '\n  className?: string;' + after);
    }
  }
  fs.writeFileSync(f, c, 'utf8');
}
console.log('done');