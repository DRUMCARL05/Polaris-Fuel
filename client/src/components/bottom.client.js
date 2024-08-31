"use client"

import '../styles/homepage.css'
import bg from '../../public/pxpBg.png'

export default function Bottom({ pxp }) {  // Accept pxp as a prop
  // Determine the level based on the pxp value
  let level = 'Bronze';
  let levelImage = '/gold.png';

  if (pxp >= 1000 && pxp < 2000) {
    level = 'Silver';
    levelImage = '/gold.png';
  } else if (pxp >= 2000) {
    level = 'Gold';
    levelImage = '/gold.png';
  }

  return (
    <div className="bottomPxp" style={{
        backgroundImage: `url(${bg.src})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center'
    }}>
        <div className="level">
            <img src={levelImage} alt={`${level} Level`} />
            <h3 className="levelText">{level} Level</h3>
        </div>
        <div className="pxp">
            <h3 className="currentHead">Current PXP</h3>
            <h3 className="pxpValue">{pxp}</h3>  {/* Display the pxp value */}
        </div>
    </div>
  );
}
