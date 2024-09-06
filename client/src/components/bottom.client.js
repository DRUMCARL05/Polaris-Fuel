"use client"

import '../styles/homepage.css'
import bg from '../../public/pxpBg.png'

export default function Bottom({ pxp }) {  // Accept pxp as a prop
  // Determine the level based on the pxp value
  let level = 'Bronze';
  let levelImage = '/GOLDpxp.png';

  if (pxp >= 0 && pxp < 2000) {
    level = 'Silver';
    levelImage = '/SILVERpxp.png';
  } else if (pxp >= 2000 && pxp < 5000) {
    level = 'Gold';
    levelImage = '/GOLDpxp.png';
  } else if (pxp >= 5000) {
    level = 'Diamond';
    levelImage = '/DIAMONDpxp.png';
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
