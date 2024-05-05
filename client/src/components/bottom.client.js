import '../styles/homepage.css'
import bg from '../../public/pxpBg.png'

export default function Bottom() {
  return (
    <div className="bottomPxp" style={{
        backgroundImage: `url(${bg.src})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center'
    }}>
        <div className="level">
            <img src="/gold.png" alt="Gold Level" />
            <h3 className="levelText">Gold Level</h3>
        </div>
        <div className="pxp">
            <h3 className="currentHead">Current PXP</h3>
            <h3 className="pxpValue">126,000</h3>
        </div>
    </div>
  );
}