import React from 'react';
import { Row, Col } from 'react-bootstrap';

import { formatPower } from '../helpers';
import './Results.css'

class Results extends React.Component {


    render() {
        let results = this.props.results;
        return (
            <div className="Results">
                <Row>
                    <Col md="6">
                        <h4 >Price <b>{results['per_kwh_cost'].toPrecision(3)}€/kWh</b></h4>
                    </Col>
                    <Col md="6">
                        {results['missing'] === 0 &&
                            <h4 ><b>100%</b> demand covered</h4>
                        }
                        {results['missing'] > 0 &&
                            <div>
                                <h4><b>{results['missing']>0.01?Math.round(results['missing'] * 100).toString():(Math.round(results['missing'] * 10000)/100).toString()}%</b> demand not covered</h4>
                                <h5><b>Need for controlled capacity {formatPower(results['missing_capa'])}W</b></h5>
                            </div>
                        }
                    </Col>
                </Row>
                <Row>
                    <Col md="6">
                        <h5>Yearly costs <b>{formatPower(results['yearly_cost'], 1e9, true)}€/yr</b></h5>
                        {
                            results['wind_cost']>0 &&
                            <h5>Wind costs <b>{formatPower(results['wind_cost'], 1e9, true)}€/yr</b></h5>
                        }
                        {
                            results['solar_cost']>0 &&
                            <h5>Solar costs <b>{formatPower(results['solar_cost'], 1e9, true)}€/yr</b></h5>
                        }
                    </Col>
                    <Col md="6">
                        {
                            results['grid_cost']>0 &&
                            <h5>Grid costs <b>{formatPower(results['grid_cost'], 1e9, true)}€/yr</b></h5>
                        }
                        {
                            results['storage_cost'] &&
                            <h5>Storage costs <b>{formatPower(results['storage_cost'], 1e9, true)}€/yr</b></h5>
                        }
                    </Col>
                </Row>
                <Row>
                    <Col>
                        {
                            results['storage_cycles_peryear'] &&
                            <h5>Average number of storage cycles <b>{Math.round(results['storage_cycles_peryear'])} cycles/yr</b></h5>
                        }
                    </Col>
                </Row>
            </div >
        );
    }
}


export { Results }; 