import React from 'react';

const Card = ({ 
  title, 
  subtitle1, 
  subtitle2, 
  actionArea, 
  minWidth 
}) => {
  return (

    <div className="map-card" style={{ cursor: 'default', ...(minWidth ? { minWidth } : {}) }}>
      <div style={{ textAlign: 'left', width: '100%' }}>
        <h3 style={{ 
          margin: 0, 
          fontSize: '1.05rem', 
          color: 'var(--text-main)', 
          whiteSpace: 'nowrap', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis' 
        }}>
          {title}
        </h3>
        
        {subtitle1 && (
          <p style={{ 
            margin: '0.3rem 0 0 0', 
            fontSize: '0.8rem', 
            color: 'var(--text-muted)', 
            display: '-webkit-box', 
            WebkitLineClamp: 3, 
            WebkitBoxOrient: 'vertical', 
            overflow: 'hidden', 
            lineHeight: '1.3' 
          }}>
            {subtitle1}
          </p>
        )}
        
        {subtitle2 && (
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {subtitle2}
          </p>
        )}
      </div>
      
      {actionArea && (
        <div style={{ width: '100%', marginTop: 'auto', paddingTop: '0.5rem' }}>
          {actionArea}
        </div>
      )}
    </div>
  );
};

export default Card;