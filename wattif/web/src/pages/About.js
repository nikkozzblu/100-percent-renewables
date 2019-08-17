import React from 'react';
import { Button } from 'react-bootstrap';
import './About.css'

class About extends React.Component {
    render() {
        return (
            <div class="About">
                <h1>Electricity supply scenarii explorer</h1>
                <p>
                    This application is an online calculator to help public
                    exploring the impacts of electrical energy policy from a country
                </p>
                <div className='centerer'>

                    <Button href="/" variant='primary' >Get start...</Button>
                </div>
                <h2>How it works ?</h2>
                <p>The scenarii are explored using historical hourly data for consumption, wind and solar load factor
                    in order to calculate the energy produced and stored each hour</p>
                <p>Based on your input the system estimate the annual cost and derive the cost per kWh of running the system</p>
                <p>Assumption is made that there is no initial or legacy production unit and the annual cost is derived from having the system yet in place (and replacing units at the end of their lifetime)</p>
                <p>Each wind or solar unit is assumed to come with a grid reinforcement cost</p>
                <p>The cost per kWh doesn't include any tax nor distribution network associated cost and cannot be compared directly to the consumer cost</p>
                <p>On the other hand the price include the capital investment and the fix operational cost so it cannot either be compared to the SPOT price (which only consider the variable operational cost)</p>
                <p>You can learn more about the model and the assumptions in <a target="_blank" href="https://github.com/nikkozzblu/100-percent-renewables/blob/master/notebooks/Impacts%20of%20100%25%20renewables.ipynb">this Notebook</a></p>
                <h2>Current stage</h2>
                <p>
                    Current available for
                    <ul><li>
                        European countries
                    </li>
                        <li>Years 2006-2015 (depending on country)
                    </li>
                        <li>Wind and solar production units</li>
                    </ul>
                </p>
                <h2>Want to contribute ?</h2>
                <p>
                    This project is open-source and actively looking for collaborators for coding, styling, adding dataset, or just promoting.
                </p>
                <p>To learn more, visit&nbsp;
    <a href="https://github.com/nikkozzblu/100-percent-renewables" target="_blank">project GitHub</a>
                </p>

                <h2>Who i am ?</h2>
                <p>
                    A French Full stack engineer and Data scientist enthusiastic about energy transition projects
                </p>
                <p>Feel free to contact me via&nbsp;
    <a href="https://www.linkedin.com/in/nicolas-juguet-68395720/" target="_blank">Linkedin</a>
                </p>
            </div>
        );
    }
}

export { About }; 