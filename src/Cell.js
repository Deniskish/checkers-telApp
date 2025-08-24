import React from 'react';

export default function Cell({ row, col, children, onClick, selected, hint }) {
  const isBlack = (row + col) % 2 !== 0;
  const className = `cell ${isBlack ? 'black' : 'white'} ${selected ? 'selected' : ''} ${hint ? 'hint' : ''}`;

  return (
    <div className={className} onClick={onClick}>
      {children}
    </div>
  );
}

