const fs = require('fs');
const files = [
  'src/shared/components/ui/Button.tsx',
  'src/shared/components/ui/Input.tsx',
  'src/shared/components/ui/Card.tsx',
  'src/shared/components/ui/Avatar.tsx',
  'src/shared/components/ui/Timeline.tsx',
  'src/shared/components/ui/Modal.tsx',
  'src/shared/components/ui/Drawer.tsx',
  'src/shared/components/PersonCard.tsx',
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
  if (!c.includes('import React')) {
    c = 'import React from "react";\n' + c;
  }
  fs.writeFileSync(f, c, 'utf8');
}
console.log('done');