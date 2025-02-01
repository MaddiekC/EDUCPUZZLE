// client/src/components/Puzzle/EquationDisplay.jsx

import React from 'react';
import PropTypes from 'prop-types';
import './Puzzle.css';

const EquationDisplay = ({ equation }) => {
  return (
    <div className="equation-display">
      <p>{equation}</p>
    </div>
  );
};

EquationDisplay.propTypes = {
  equation: PropTypes.string.isRequired,
};

export default EquationDisplay;
