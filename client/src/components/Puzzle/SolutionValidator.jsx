// client/src/components/Puzzle/SolutionValidator.jsx

import React from 'react';
import PropTypes from 'prop-types';
import './Puzzle.css';

const SolutionValidator = ({ isValid, message }) => {
  return (
    <div className="solution-validator">
      {isValid ? (
        <p className="valid">¡Solución correcta!</p>
      ) : (
        <p className="invalid">{message || 'La solución es incorrecta.'}</p>
      )}
    </div>
  );
};

SolutionValidator.propTypes = {
  isValid: PropTypes.bool.isRequired,
  message: PropTypes.string,
};

SolutionValidator.defaultProps = {
  message: '',
};

export default SolutionValidator;
