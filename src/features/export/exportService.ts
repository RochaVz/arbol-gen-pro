import type { Person, Relationship, Event, Tree } from '../../core/db/schema';


export interface ExportBundle {
  tree: Tree;
  persons: Person[];
  relationships: Relationship[];
  events: Event[];
  exportedAt: string;
}

export function exportToJson(bundle: ExportBundle): string {
  return JSON.stringify(bundle, null, 2);
}

function gedcomDate(d?: any): string {
  if (!d) return '';
  const y = d.year;
  const m = d.month ? String(d.month).padStart(2, '0') : '';
  const day = d.day ? String(d.day).padStart(2, '0') : '';
  return [day, m, y].filter(Boolean).join(' ');
}

export function exportToGedcom(bundle: ExportBundle): string {
  const lines: string[] = [];
  lines.push('0 HEAD');
  lines.push('1 SOUR ARBOL-GEN-PRO');
  lines.push('1 GEDC');
  lines.push('2 VERS 5.5.1');
  lines.push('2 FORM LINEAGE-LINKED');
  lines.push('1 CHAR UTF-8');
  lines.push(`1 DATE ${new Date().toISOString().slice(0, 10)}`);
  // individuals
  for (const p of bundle.persons) {
    lines.push(`0 @I${p.id}@ INDI`);
    lines.push(`1 NAME ${p.firstName ?? ''} /${p.lastName ?? ''}/`);
    if (p.sex) lines.push(`1 SEX ${p.sex === 'male' ? 'M' : p.sex === 'female' ? 'F' : 'U'}`);
    if (p.birthDate) {
      lines.push('1 BIRT');
      lines.push(`2 DATE ${gedcomDate(p.birthDate)}`);
      if (p.birthplace?.name) lines.push(`2 PLAC ${p.birthplace.name}`);
    }
    if (p.deathDate) {
      lines.push('1 DEAT');
      lines.push(`2 DATE ${gedcomDate(p.deathDate)}`);
      if (p.deathPlace?.name) lines.push(`2 PLAC ${p.deathPlace.name}`);
    }
    if (p.biography) lines.push(`1 NOTE ${p.biography.replace(/\n/g, ' ')}`);
  }
  // families
  let famIdx = 0;
  const families = new Map<string, string[]>();
  for (const r of bundle.relationships) {
    const t = String(r.type ?? '').toLowerCase();
    if (!(t.includes('spouse') || t.includes('partner') || t.includes('marriage'))) continue;
    const a = r.person1Id ?? r.personId;
    const b = r.person2Id ?? r.relativeId;
    if (!a || !b) continue;
    const key = [a, b].sort().join('|');
    if (families.has(key)) continue;
    families.set(key, [a, b]);
  }
  for (const [, [a, b]] of families) {

    const famId = `F${famIdx++}`;
    lines.push(`0 @${famId}@ FAM`);
    lines.push(`1 HUSB @I${a}@`);
    lines.push(`1 WIFE @I${b}@`);
    // children: relationships of type child where parent in {a,b}
    const kids = bundle.relationships
      .filter((r) => {
        const t = String(r.type ?? '').toLowerCase();
        if (!(t.includes('child') || t.includes('son') || t.includes('daughter'))) return false;
        const to = r.person2Id ?? r.relativeId;
        // to is parent
        return to === a || to === b;
      })
      .map((r) => r.person1Id ?? r.personId);
    for (const c of new Set(kids)) lines.push(`1 CHIL @I${c}@`);
  }
  lines.push('0 TRLR');
  return lines.join('\n');
}

export function downloadText(filename: string, content: string, mime = 'text/plain'): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
