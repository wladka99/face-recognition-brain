import React from "react";
import Tilt from 'react-parallax-tilt';
import './Logo.css';
import brain from './brain.png'

const Logo = () => {
    return(
<div style={{width: "150px"}} className="ma4 mt0">
    <Tilt className="logo-tilt br2 shadow-2">
      <div style={{ height: '150px', width: '150px'}}>
        <img className="pa3" style={{paddingTop:'25px'}} src={brain} alt="logo"/>
      </div>
    </Tilt>
</div>
    )
}

export default Logo;