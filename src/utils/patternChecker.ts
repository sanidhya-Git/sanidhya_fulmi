type Cell = { number: number; marked: boolean };
export type CheckResult = { matched: boolean; coords: [number, number][] };

function allTrue(arr: boolean[]) { return arr.every(Boolean); }

export function checkPattern(grid: Cell[][], pattern: string): CheckResult {
  const M = grid.map(row => row.map(cell => Boolean(cell.marked)));
  const coords: [number,number][] = [];
  const rows = 5, cols = 5;
  const rowIsFull = (r: number) => allTrue(M[r]);
  const colIsFull = (c: number) => allTrue(M.map(r => r[c]));
  const diag1 = () => allTrue([0,1,2,3,4].map(i => M[i][i]));
  const diag2 = () => allTrue([0,1,2,3,4].map(i => M[i][4-i]));
  const pushRow = (r: number) => { for (let c=0;c<cols;c++) coords.push([r,c]); };
  const pushCol = (c: number) => { for (let r=0;r<rows;r++) coords.push([r,c]); };
  const pushDiag1 = () => { for (let i=0;i<5;i++) coords.push([i,i]); };
  const pushDiag2 = () => { for (let i=0;i<5;i++) coords.push([i,4-i]); };

  switch (pattern) {
    case 'SingleLine':
      for (let r=0;r<rows;r++) if (rowIsFull(r)) { pushRow(r); return { matched:true, coords }; }
      for (let c=0;c<cols;c++) if (colIsFull(c)) { pushCol(c); return { matched:true, coords }; }
      if (diag1()) { pushDiag1(); return { matched:true, coords }; }
      if (diag2()) { pushDiag2(); return { matched:true, coords }; }
      return { matched:false, coords:[] };

    case 'TwoLines': {
      let lines: [string, number][] = [];
      for (let r=0;r<rows;r++) if (rowIsFull(r)) lines.push(['row',r]);
      for (let c=0;c<cols;c++) if (colIsFull(c)) lines.push(['col',c]);
      if (diag1()) lines.push(['diag',1]);
      if (diag2()) lines.push(['diag',2]);
      if (lines.length >= 2) {
        for (const [t,i] of lines.slice(0,2)) {
          if (t === 'row') pushRow(i as number);
          if (t === 'col') pushCol(i as number);
          if (t === 'diag' && i === 1) pushDiag1();
          if (t === 'diag' && i === 2) pushDiag2();
        }
        return { matched: true, coords };
      }
      return { matched:false, coords:[] };
    }

    case 'FullHouse':
      if (M.every(r => r.every(Boolean))) {
        for (let r=0;r<rows;r++) for (let c=0;c<cols;c++) coords.push([r,c]);
        return { matched:true, coords };
      }
      return { matched:false, coords:[] };

    case 'FourCorners':
      if (M[0][0] && M[0][4] && M[4][0] && M[4][4]) return { matched:true, coords:[[0,0],[0,4],[4,0],[4,4]]};
      return { matched:false, coords:[] };

    case 'PictureFrame': {
      const edges: [number,number][] = [];
      for (let c=0;c<cols;c++) edges.push([0,c]);
      for (let r=1;r<rows-1;r++) edges.push([r,cols-1]);
      for (let c=cols-1;c>=0;c--) edges.push([rows-1,c]);
      for (let r=rows-2;r>=1;r--) edges.push([r,0]);
      if (edges.every(([r,c]) => M[r][c])) return { matched:true, coords: edges };
      return { matched:false, coords:[] };
    }

    case 'X':
      if (diag1() && diag2()) { pushDiag1(); pushDiag2(); return { matched:true, coords }; }
      return { matched:false, coords:[] };

    case 'T':
      if (rowIsFull(0) && colIsFull(2)) { pushRow(0); pushCol(2); return { matched:true, coords }; }
      return { matched:false, coords:[] };

    case 'L':
      if (colIsFull(0) && rowIsFull(4)) { pushCol(0); pushRow(4); return { matched:true, coords }; }
      return { matched:false, coords:[] };

    case 'PostageStamp': {
      const blocks = [
        [[0,0],[0,1],[1,0],[1,1]],
        [[0,3],[0,4],[1,3],[1,4]],
        [[3,0],[3,1],[4,0],[4,1]],
        [[3,3],[3,4],[4,3],[4,4]]
      ];
      for (const b of blocks) if (b.every(([r,c]) => M[r][c])) return { matched:true, coords: b as [number,number][] };
      return { matched:false, coords:[] };
    }

    case 'SixPack':
      for (let r=0;r<=3;r++) for (let c=0;c<=2;c++) {
        let ok = true; const cells: [number,number][]=[];
        for (let rr=r; rr<r+2; rr++) for (let cc=c; cc<c+3; cc++) { cells.push([rr,cc]); if (!M[rr][cc]) ok=false; }
        if (ok) return { matched:true, coords: cells };
      }
      return { matched:false, coords:[] };

    case 'NinePack':
      for (let r=0;r<=2;r++) for (let c=0;c<=2;c++) {
        let ok = true; const cells: [number,number][]=[];
        for (let rr=r; rr<r+3; rr++) for (let cc=c; cc<c+3; cc++) { cells.push([rr,cc]); if (!M[rr][cc]) ok=false; }
        if (ok) return { matched:true, coords: cells };
      }
      return { matched:false, coords:[] };

    case 'Cross':
      if (rowIsFull(2) && colIsFull(2)) { pushRow(2); pushCol(2); return { matched:true, coords }; }
      return { matched:false, coords:[] };

    default:
      return { matched:false, coords:[] };
  }
}
