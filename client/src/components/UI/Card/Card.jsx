// client/src/components/UI/Card/Card.jsx

import React from 'react';
import PropTypes from 'prop-types';
import './Card.css';

const Card = ({ title, children, className, ...rest }) => {
  return (
    <div className={`card ${className}`} {...rest}>
      {title && <h3 className="card-title">{title}</h3>}
      <div className="card-body">{children}</div>
    </div>
  );
};

Card.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node,
  className: PropTypes.string,
};

Card.defaultProps = {
  title: '',
  children: null,
  className: '',
};

export default Card;
