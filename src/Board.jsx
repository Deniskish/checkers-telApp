import React, { useState } from 'react';
import Cell from './Cell';
import Piece from './Piece';

const SIZE = 8;

export default function Board() {
  const initBoard = () => {
    const grid = [];
    for (let r = 0; r < SIZE; r++) {
      const row = [];
      for (let c = 0; c < SIZE; c++) {
        let piece = null;
        if ((r + c) % 2 === 1) {
          if (r < 3) piece = { color: 'black', king: false };
          if (r > 4) piece = { color: 'white', king: false };
        }
        row.push({ row: r, col: c, piece });
      }
      grid.push(row);
    }
    return grid;
  };

  const [board, setBoard] = useState(initBoard);
  const [selected, setSelected] = useState(null);
  const [turn, setTurn] = useState('white');
  const [winner, setWinner] = useState(null);

  const inBounds = (r, c) => r >= 0 && r < SIZE && c >= 0 && c < SIZE;

  const getMovesForPiece = (r, c, piece, captureOnly = false) => {
    const moves = [];
    const directions = [[-1,-1], [-1,1], [1,-1], [1,1]];
    const isEnemy = (p) => p && p.color !== piece.color;

    const addMove = (from, to, captured) => {
      moves.push({ from, to, captured });
    };

    if (piece.king) {
      directions.forEach(([dr, dc]) => {
        let rr = r + dr, cc = c + dc, captured = null;
        while (inBounds(rr, cc)) {
          const cell = board[rr][cc];
          if (!cell.piece) {
            if (!captureOnly && !captured) {
              addMove({ row: r, col: c }, { row: rr, col: cc }, []);
            } else if (captured) {
              addMove({ row: r, col: c }, { row: rr, col: cc }, [captured]);
            }
            rr += dr; cc += dc;
          } else if (isEnemy(cell.piece) && !captured) {
            captured = { row: rr, col: cc };
            rr += dr; cc += dc;
          } else {
            break;
          }
        }
      });
    } else {
      directions.forEach(([dr, dc]) => {
        const rr = r + dr, cc = c + dc;
        if (!inBounds(rr, cc)) return;
        const cell = board[rr][cc];
        if (!cell.piece && !captureOnly) {
          if ((piece.color === 'white' && dr === -1) || (piece.color === 'black' && dr === 1)) {
            addMove({ row: r, col: c }, { row: rr, col: cc }, []);
          }
        } else if (isEnemy(cell.piece)) {
          const rr2 = rr + dr, cc2 = cc + dc;
          if (inBounds(rr2, cc2) && !board[rr2][cc2].piece) {
            addMove({ row: r, col: c }, { row: rr2, col: cc2 }, [{ row: rr, col: cc }]);
          }
        }
      });
    }
    return moves;
  };

  const getAllMoves = (color) => {
    let all = [];
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const piece = board[r][c].piece;
        if (piece && piece.color === color) {
          all.push(...getMovesForPiece(r, c, piece));
        }
      }
    }
    const captures = all.filter(m => m.captured.length > 0);
    return captures.length > 0 ? captures : all;
  };

  const handleCellClick = (row, col) => {
    if (winner) return;
    const cell = board[row][col];

    if (selected) {
      const moves = getAllMoves(turn).filter(
        m => m.from.row === selected.row && m.from.col === selected.col
      );
      const move = moves.find(m => m.to.row === row && m.to.col === col);
      if (move) doMove(move);
      setSelected(null);
    } else if (cell.piece && cell.piece.color === turn) {
      setSelected({ row, col });
    }
  };

  const doMove = (move) => {
    const newBoard = board.map(row => row.map(cell => ({ ...cell })));
    const piece = { ...newBoard[move.from.row][move.from.col].piece };
    newBoard[move.from.row][move.from.col].piece = null;
    move.captured.forEach(c => {
      newBoard[c.row][c.col].piece = null;
    });
    newBoard[move.to.row][move.to.col].piece = piece;

    if (!piece.king) {
      if (piece.color === 'white' && move.to.row === 0) piece.king = true;
      if (piece.color === 'black' && move.to.row === SIZE - 1) piece.king = true;
    }
    setBoard(newBoard);

    if (move.captured.length > 0) {
      const moreCaptures = getMovesForPiece(move.to.row, move.to.col, piece, true);
      if (moreCaptures.length > 0) {
        setSelected({ row: move.to.row, col: move.to.col });
        return;
      }
    }

    const nextMoves = getAllMoves(turn === 'white' ? 'black' : 'white');
    if (nextMoves.length === 0) {
      setWinner(turn);
    } else {
      setTurn(turn === 'white' ? 'black' : 'white');
    }
  };

  const getHints = () => {
    if (!selected) return [];
    const moves = getAllMoves(turn).filter(
      m => m.from.row === selected.row && m.from.col === selected.col
    );
    return moves.map(m => `${m.to.row},${m.to.col}`);
  };

  const hints = getHints();

  return (
    <div>
      <h2>
        {winner
          ? `Победили ${winner === 'white' ? 'Белые' : 'Чёрные'}!`
          : `Ход: ${turn === 'white' ? 'Белые' : 'Чёрные'}`}
      </h2>
      <div className="board">
        {board.map((rowArr, r) => (
          <div className="board-row" key={r}>
            {rowArr.map((cell, c) => (
              <Cell
                key={c}
                row={cell.row}
                col={cell.col}
                selected={selected && selected.row === cell.row && selected.col === cell.col}
                onClick={() => handleCellClick(cell.row, cell.col)}
                hint={hints.includes(`${cell.row},${cell.col}`)}
              >
                {cell.piece && <Piece color={cell.piece.color} king={cell.piece.king} />}
              </Cell>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

