import React from 'react';

export default function Piece({ color, king }) {
  return (
    <div className={`piece ${color} ${king ? 'king' : ''}`}>
      {king && <span className="king-mark">K</span>}
    </div>
  );
}

