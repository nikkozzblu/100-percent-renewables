import React from 'react';
import circle from '../circle.svg'

class Loader extends React.Component {
    render() {
        return (
            <div className="centerer" >
                <img alt="loading" src={circle} className='circle' />
                <span className="small-text">&nbsp;{this.props.msg}</span>
            </div>
        );
    }
}


export { Loader }; 