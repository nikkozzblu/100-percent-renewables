import React from 'react';
import { Alert, Form, InputGroup, Row, Col, Button, ButtonGroup } from 'react-bootstrap';
import './Settings.css'
// import { apiService } from '../services'
import { Loader } from '../helpers'


function default_settings() {
    return {
        has_wind: true,
        has_solar: true,
        has_storage: true,

        wind_capa: false,
        solar_capa: 50,
        storage_capa: 5000,

        storage_efficiency: 90,
        costs: {
            wind_capex: 1.5,
            solar_capex: 1.0,
            grid_capex: 1.5,
            wind_opex: 45,
            solar_opex: 8,
            wind_lifetime: 25,
            solar_lifetime: 25,
            grid_lifetime: 50,
            storage_capex: 0.2,
            storage_opex: 0.065,
            storage_cycles: 1500
        }
    }
}

class Settings extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            options: props.settings,
            validated: false,
            optimvalidated: false,
            tab: 'calculate'
        };

        this.calculate = this.calculate.bind(this);
        this.optimize = this.optimize.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleCostChange = this.handleCostChange.bind(this);

    }

    componentWillReceiveProps() {
        if (this.props.settings) {
            let sets = this.props.settings;
            if (sets['wind_capa']) sets.wind_capa = Math.round(sets['wind_capa'] * 10) / 10;
            if (sets['solar_capa']) sets.solar_capa = Math.round(sets['solar_capa'] * 10) / 10;
            if (sets['storage_capa']) sets.storage_capa = Math.round(sets['storage_capa']);
            this.setState({ options: this.props.settings });

        }
    }

    handleChange(e) {
        let { name, value, checked } = e.target;
        let sp = name.split('.');
        name = sp[0];
        let obj = this.state[name];

        obj[sp[1]] = value === "on" ? checked : value;

        this.setState({ [name]: obj });
        this.props.setSettings(obj);
    }

    handleCostChange(e) {
        let { name, value, checked } = e.target;
        let sp = name.split('.');
        name = sp[0];
        let obj = this.state.options;

        obj.costs[sp[2]] = value === "on" ? checked : value;

        this.setState({ [name]: obj });
        this.props.setSettings(obj);
    }

    calculate(event) {
        event.preventDefault();
        event.stopPropagation();
        this.setState({ validated: true });
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            this.setState({ error: 'Please correct error(s) in the form' })
            return false;
        }
        this.setState({ validated: true, loading: true, error: false });
        let options = this.state.options
        if (!options.has_wind) options['wind_capa'] = 0;
        if (!options.has_solar) options['solar_capa'] = 0;
        if (!options.has_storage) options['storage_capa'] = 0;
        this.setState({ options: options });
        this.props.calculate(options).then(() => this.setState({ loading: false }), e => this.setState({ loading: false, error: 'Something went wrong,... please try again.\n' + e }));
    }


    optimize(event) {
        event.preventDefault();
        event.stopPropagation();
        const form = event.currentTarget;
        this.setState({ optimvalidated: true });
        if (form.checkValidity() === false) {
            this.setState({ error: 'Please correct error(s) in the form' })
            return false;
        }
        this.setState({ optimvalidated: true, loading: true, error: false });
        let options = this.state.options;
        this.props.optimize(options).then(() => this.setState({ loading: false, tab: 'calculate' }), e => this.setState({ loading: false, error: 'Something went wrong,... please try again.\n' + e }));
    }

    render() {
        const { options, validated, optimvalidated, loading, tab, error } = this.state;

        return (
            <div className="Settings">

                <div className="centerer">
                    <ButtonGroup>
                        <Button className='btn-sm' variant={tab === 'calculate' ? 'secondary' : 'info'} type="button" onClick={() => this.setState({ tab: 'calculate' })}>
                            Calculate
                            </Button>

                        <Button className='btn-sm' variant={tab === 'optimize' ? 'secondary' : 'info'} type="button" onClick={() => this.setState({ tab: 'optimize' })}>
                            Optimize
                            </Button>

                        <Button className='btn-sm' variant={tab === 'settings' ? 'secondary' : 'info'} type="button" onClick={() => this.setState({ tab: 'settings' })}>
                            Settings
                            </Button>
                    </ButtonGroup>
                </div>
                <div className='tab-contents'>
                    <Form noValidate validated={validated} onSubmit={this.calculate}>
                        <div className={'narrow-width pad-top tab-content fade' + (tab === 'calculate' ? ' show' : '')}>

                            <Form.Group as={Row} controlId="formWindCapacity">
                                <Col sm="5">
                                    <Form.Check inline label="Wind capacity" type='checkbox'

                                        name="options.has_wind"
                                        onChange={this.handleChange} checked={options.has_wind} />
                                </Col>
                                <Col sm="7">
                                    <InputGroup >
                                        <InputGroup.Append>
                                            <InputGroup.Text id="inputGroupPrepend">GW</InputGroup.Text>
                                        </InputGroup.Append>
                                        <Form.Control
                                            type="number" min="0" step="0.1" value={options.wind_capa}
                                            placeholder="Wind capacity in GW" name="options.wind_capa"
                                            aria-describedby="inputGroupPrepend"
                                            required onChange={this.handleChange}
                                            disabled={options.has_wind ? '' : 'disabled'}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            Please specify a valid installed wind capacity
                        </Form.Control.Feedback>
                                    </InputGroup>
                                </Col>
                            </Form.Group>

                            <Form.Group as={Row} controlId="formSolarCapacity">
                                <Col sm="5">
                                    <Form.Check inline label="Solar capacity" type='checkbox' name="options.has_solar"
                                        onChange={this.handleChange} checked={options.has_solar} />
                                </Col>
                                <Col sm="7">
                                    <InputGroup >
                                        <InputGroup.Append>
                                            <InputGroup.Text id="inputGroupPrepend">GW</InputGroup.Text>
                                        </InputGroup.Append>
                                        <Form.Control
                                            type="number" min="0" step="0.1" value={options.solar_capa}
                                            placeholder="Solar capacity in GW" name="options.solar_capa"
                                            aria-describedby="inputGroupPrepend"
                                            required onChange={this.handleChange}
                                            disabled={options.has_solar ? '' : 'disabled'}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            Please specify a valid installed solar capacity
                        </Form.Control.Feedback>
                                    </InputGroup>
                                </Col>
                            </Form.Group>

                            <Form.Group as={Row} controlId="formStorageCapacity">
                                <Col sm="5">
                                    <Form.Check inline label="Storage capacity" type='checkbox' name="options.has_storage"
                                        onChange={this.handleChange} checked={options.has_storage} />
                                </Col>
                                <Col sm="7">
                                    <InputGroup >
                                        <InputGroup.Append>
                                            <InputGroup.Text id="inputGroupPrepend">GWh</InputGroup.Text>
                                        </InputGroup.Append>
                                        <Form.Control
                                            type="number" min="0" value={options.storage_capa}
                                            placeholder="Storage capacity in GW" name="options.storage_capa"
                                            aria-describedby="inputGroupPrepend"
                                            required onChange={this.handleChange}
                                            disabled={options.has_storage ? '' : 'disabled'}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            Please specify a valid installed storage capacity
                        </Form.Control.Feedback>
                                    </InputGroup>
                                </Col>
                            </Form.Group>
                            {!loading &&
                                <div className="centerer">

                                    <Button variant="primary" type="submit" >
                                        Calculate
                                    </Button>

                                </div>
                            }
                            {error &&
                                <Alert variant='danger'>{error}<p>If the problem persist please contact us to report this bug</p></Alert>

                            }
                            {loading &&
                                <Loader />
                            }
                        </div>
                        <div className={'small-text tab-content fade' + (tab === 'settings' ? ' show' : '')}>
                            <Form.Row>
                                <Col xs={6} sm={4}>

                                    <Form.Group controlId="formWindCapex">
                                        <Form.Label>Wind CAPEX</Form.Label>
                                        <InputGroup >
                                            <InputGroup.Append>
                                                <InputGroup.Text id="inputGroupPrepend">M€/GW</InputGroup.Text>
                                            </InputGroup.Append>
                                            <Form.Control
                                                type="number" min="0" step="0.01" value={options.costs.wind_capex}
                                                placeholder="Wind CAPEX in M€/GW" name="options.costs.wind_capex"
                                                aria-describedby="inputGroupPrepend"
                                                required onChange={this.handleCostChange}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                Please specify a valid wind CAPEX
                                        </Form.Control.Feedback>
                                        </InputGroup>
                                    </Form.Group>
                                </Col>
                                <Col xs={6} sm={4}>
                                    <Form.Group controlId="formWindOpex">
                                        <Form.Label>Wind OPEX</Form.Label>
                                        <InputGroup >
                                            <InputGroup.Append>
                                                <InputGroup.Text id="inputGroupPrepend">k€/GW/yr</InputGroup.Text>
                                            </InputGroup.Append>
                                            <Form.Control
                                                type="number" min="0" step="0.01" value={options.costs.wind_opex}
                                                placeholder="Wind OPEX in k€/GW" name="options.costs.wind_opex"
                                                aria-describedby="inputGroupPrepend"
                                                required onChange={this.handleCostChange}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                Please specify a valid wind OPEX
                                        </Form.Control.Feedback>
                                        </InputGroup>
                                    </Form.Group>
                                </Col>
                                <Col xs={6} sm={4}>
                                    <Form.Group controlId="formWindLifetime">
                                        <Form.Label>Wind lifetime</Form.Label>
                                        <InputGroup >
                                            <InputGroup.Append>
                                                <InputGroup.Text id="inputGroupPrepend">yrs</InputGroup.Text>
                                            </InputGroup.Append>
                                            <Form.Control
                                                type="number" min="0" value={options.costs.wind_lifetime}
                                                placeholder="Lifetime in yr" name="options.costs.wind_lifetime"
                                                aria-describedby="inputGroupPrepend"
                                                required onChange={this.handleCostChange}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                Please specify a valid wind lifetime
                                        </Form.Control.Feedback>
                                        </InputGroup>
                                    </Form.Group>
                                </Col>
                            
                                <Col xs={6} sm={4}>
                                    <Form.Group controlId="formSolarCapex">
                                        <Form.Label>Solar CAPEX</Form.Label>
                                        <InputGroup >
                                            <InputGroup.Append>
                                                <InputGroup.Text id="inputGroupPrepend">M€/GW</InputGroup.Text>
                                            </InputGroup.Append>
                                            <Form.Control
                                                type="number" min="0" step="0.01" value={options.costs.solar_capex}
                                                placeholder="Solar CAPEX in M€/GW" name="options.costs.solar_capex"
                                                aria-describedby="inputGroupPrepend"
                                                required onChange={this.handleCostChange}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                Please specify a valid solar CAPEX
                                        </Form.Control.Feedback>
                                        </InputGroup>
                                    </Form.Group>
                                </Col>
                                <Col xs={6} sm={4}>
                                    <Form.Group controlId="formSolarOpex">
                                        <Form.Label>Solar OPEX</Form.Label>
                                        <InputGroup >
                                            <InputGroup.Append>
                                                <InputGroup.Text id="inputGroupPrepend">k€/GW/yr</InputGroup.Text>
                                            </InputGroup.Append>
                                            <Form.Control
                                                type="number" min="0" step="0.01" value={options.costs.solar_opex}
                                                placeholder="Solar OPEX in k€/GW" name="options.costs.solar_opex"
                                                aria-describedby="inputGroupPrepend"
                                                required onChange={this.handleCostChange}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                Please specify a valid solar OPEX
                                        </Form.Control.Feedback>
                                        </InputGroup>
                                    </Form.Group>
                                </Col>
                                <Col xs={6} sm={4}>
                                    <Form.Group controlId="formSolarLifetime">
                                        <Form.Label>Solar lifetime</Form.Label>
                                        <InputGroup >
                                            <InputGroup.Append>
                                                <InputGroup.Text id="inputGroupPrepend">yrs</InputGroup.Text>
                                            </InputGroup.Append>
                                            <Form.Control
                                                type="number" min="0" value={options.costs.solar_lifetime}
                                                placeholder="Lifetime in yr" name="options.costs.solar_lifetime"
                                                aria-describedby="inputGroupPrepend"
                                                required onChange={this.handleCostChange}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                Please specify a valid solar lifetime
                                        </Form.Control.Feedback>
                                        </InputGroup>
                                    </Form.Group>
                                </Col>
                            
                                <Col xs={6} sm={4}>
                                    <Form.Group controlId="formStorageCapex">
                                        <Form.Label>Storage CAPEX</Form.Label>
                                        <InputGroup >
                                            <InputGroup.Append>
                                                <InputGroup.Text id="inputGroupPrepend">M€/GWh</InputGroup.Text>
                                            </InputGroup.Append>
                                            <Form.Control
                                                type="number" min="0" step="0.01" value={options.costs.storage_capex}
                                                placeholder="Storage CAPEX in M€/GWh" name="options.costs.storage_capex"
                                                aria-describedby="inputGroupPrepend"
                                                required onChange={this.handleCostChange}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                Please specify a valid storage CAPEX
                                        </Form.Control.Feedback>
                                        </InputGroup>
                                    </Form.Group>
                                </Col>
                                <Col xs={6} sm={4}>
                                    <Form.Group controlId="formStorageOpex">
                                        <Form.Label>Storage OPEX</Form.Label>
                                        <InputGroup >
                                            <InputGroup.Append>
                                                <InputGroup.Text id="inputGroupPrepend">k€/GWh/yr</InputGroup.Text>
                                            </InputGroup.Append>
                                            <Form.Control
                                                type="number" min="0" step="0.0001" value={options.costs.storage_opex}
                                                placeholder="Storage OPEX in k€/GWh" name="options.costs.storage_opex"
                                                aria-describedby="inputGroupPrepend"
                                                required onChange={this.handleCostChange}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                Please specify a valid storage OPEX
                                        </Form.Control.Feedback>
                                        </InputGroup>
                                    </Form.Group>
                                </Col>
                                <Col xs={6} sm={4}>
                                    <Form.Group controlId="formStorageLifetime">
                                        <Form.Label>Storage max. cycles</Form.Label>
                                        <InputGroup >
                                            <InputGroup.Append>
                                                <InputGroup.Text id="inputGroupPrepend">cycles</InputGroup.Text>
                                            </InputGroup.Append>
                                            <Form.Control
                                                type="number" min="0" value={options.costs.storage_cycles}
                                                placeholder="Max. storage cycles" name="options.costs.storage_cycles"
                                                aria-describedby="inputGroupPrepend"
                                                onChange={this.handleCostChange} required
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                Please specify a valid storage max number of cycles
                                        </Form.Control.Feedback>
                                        </InputGroup>
                                    </Form.Group>
                                </Col>
                            
                                <Col xs={6} sm={4}>
                                    <Form.Group controlId="formStorageEfficiency">
                                        <Form.Label>Storage efficiency</Form.Label>
                                        <InputGroup >
                                            <InputGroup.Append>
                                                <InputGroup.Text id="inputGroupPrepend">%</InputGroup.Text>
                                            </InputGroup.Append>
                                            <Form.Control
                                                type="number" min="0" value={options.storage_efficiency}
                                                placeholder="Storage efficiency in %" name="options.storageefficiency"
                                                aria-describedby="inputGroupPrepend"
                                                required onChange={this.handleCostChange}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                Please specify a valid storage efficiency
                                        </Form.Control.Feedback>
                                        </InputGroup>
                                    </Form.Group>
                                </Col>
                                <Col xs={6} sm={4}>
                                    <Form.Group controlId="formGridCapex">
                                        <Form.Label className="label-multiline">Grid CAPEX (by GW wind or solar)</Form.Label>
                                        <InputGroup >
                                            <InputGroup.Append>
                                                <InputGroup.Text id="inputGroupPrepend">M€/GW</InputGroup.Text>
                                            </InputGroup.Append>
                                            <Form.Control
                                                type="number" min="0" step="0.01" value={options.costs.grid_capex}
                                                placeholder="Grid CAPEX in M€/GWh" name="options.costs.grid_capex"
                                                aria-describedby="inputGroupPrepend"
                                                required onChange={this.handleCostChange}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                Please specify a valid storage OPEX
                                        </Form.Control.Feedback>
                                        </InputGroup>
                                    </Form.Group>
                                </Col>
                                <Col xs={6} sm={4}>
                                    <Form.Group controlId="formStorageLifetime">
                                        <Form.Label>Grid lifetime</Form.Label>
                                        <InputGroup >
                                            <InputGroup.Append>
                                                <InputGroup.Text id="inputGroupPrepend">yrs</InputGroup.Text>
                                            </InputGroup.Append>
                                            <Form.Control
                                                type="number" min="0" value={options.costs.grid_lifetime}
                                                placeholder="Grid lifetime in years" name="options.costs.grid_lifetime"
                                                aria-describedby="inputGroupPrepend"
                                                onChange={this.handleCostChange} required
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                Please specify a valid grid lifetime
                                        </Form.Control.Feedback>
                                        </InputGroup>
                                    </Form.Group>
                                </Col>
                            </Form.Row>


                        </div>


                    </Form>
                    <div className={'narrow-width tab-content fade' + (tab === 'optimize' ? ' show' : '')}>
                        <div className="centerer">Optional constraints for optimisation</div>
                        <Form noValidate validated={optimvalidated} onSubmit={this.optimize}>
                            <Form.Row>
                                <Col xs={6} sm={4}>
                                    <Form.Group controlId="formMinWind">
                                        <Form.Label>Min. Wind capacity</Form.Label>
                                        <InputGroup >
                                            <InputGroup.Append>
                                                <InputGroup.Text id="inputGroupPrepend">GW</InputGroup.Text>
                                            </InputGroup.Append>
                                            <Form.Control
                                                type="number" min="0" value={options.wind_min}
                                                placeholder="Minimum wind capacity in GW" name="options.wind_min"
                                                aria-describedby="inputGroupPrepend"
                                                onChange={this.handleChange}

                                            />
                                        </InputGroup>
                                    </Form.Group>
                                </Col>
                                <Col xs={6} sm={4}>
                                    <Form.Group controlId="formMaxWind">
                                        <Form.Label>Max. Wind capacity</Form.Label>
                                        <InputGroup >
                                            <InputGroup.Append>
                                                <InputGroup.Text id="inputGroupPrepend">GW</InputGroup.Text>
                                            </InputGroup.Append>
                                            <Form.Control
                                                type="number" min="0" value={options.wind_max}
                                                placeholder="Maximum wind capacity in GW" name="options.wind_max"
                                                aria-describedby="inputGroupPrepend"
                                                onChange={this.handleChange}

                                            />

                                        </InputGroup>
                                    </Form.Group>
                                </Col>
                            
                                <Col xs={6} sm={4}>
                                    <Form.Group controlId="formMinSolar">
                                        <Form.Label>Min. Solar capacity</Form.Label>
                                        <InputGroup >
                                            <InputGroup.Append>
                                                <InputGroup.Text id="inputGroupPrepend">GW</InputGroup.Text>
                                            </InputGroup.Append>
                                            <Form.Control
                                                type="number" min="0" value={options.solar_min}
                                                placeholder="Minimum solar capacity in GW" name="options.solar_min"
                                                aria-describedby="inputGroupPrepend"
                                                onChange={this.handleChange}

                                            />
                                        </InputGroup>
                                    </Form.Group>
                                </Col>
                                <Col xs={6} sm={4}>
                                    <Form.Group controlId="formMaxSolar">
                                        <Form.Label>Max. Solar capacity</Form.Label>
                                        <InputGroup >
                                            <InputGroup.Append>
                                                <InputGroup.Text id="inputGroupPrepend">GW</InputGroup.Text>
                                            </InputGroup.Append>
                                            <Form.Control
                                                type="number" min="0" value={options.solar_max}
                                                placeholder="Maximum solar capacity in GW" name="options.solar_max"
                                                aria-describedby="inputGroupPrepend"
                                                onChange={this.handleChange}

                                            />
                                        </InputGroup>
                                    </Form.Group>
                                </Col>
                            
                                <Col xs={6} sm={4}>
                                    <Form.Group controlId="formMinStorage">
                                        <Form.Label>Min. Storage capacity</Form.Label>
                                        <InputGroup >
                                            <InputGroup.Append>
                                                <InputGroup.Text id="inputGroupPrepend">GWh</InputGroup.Text>
                                            </InputGroup.Append>
                                            <Form.Control
                                                type="number" min="0" value={options.storage_min}
                                                placeholder="Minimum storage capacity in GWh" name="options.storage_min"
                                                aria-describedby="inputGroupPrepend"
                                                onChange={this.handleChange}

                                            />
                                        </InputGroup>
                                    </Form.Group>
                                </Col>
                                <Col xs={6} sm={4}>
                                    <Form.Group controlId="formMaxStorage">
                                        <Form.Label>Max. Storage capacity</Form.Label>
                                        <InputGroup >
                                            <InputGroup.Append>
                                                <InputGroup.Text id="inputGroupPrepend">GWh</InputGroup.Text>
                                            </InputGroup.Append>
                                            <Form.Control
                                                type="number" min="0" value={options.storage_max}
                                                placeholder="Maximum storage capacity in GWh" name="options.storage_max"
                                                aria-describedby="inputGroupPrepend"
                                                onChange={this.handleChange}
                                                disabled={options.has_storage ? '' : 'disabled'}
                                            />
                                        </InputGroup>
                                    </Form.Group>
                                </Col>
                            </Form.Row>
                            {!loading &&
                                <div className="centerer">

                                    <Button variant="primary" type="submit" >
                                        Optimize
                                    </Button>

                                </div>
                            }
                            {error &&
                                <Alert variant='danger'>{error}<p>If the problem persist please contact us to report this bug</p></Alert>

                            }
                            {loading &&
                                <Loader msg="Please wait, this could take up to 1 minute..." />
                            }
                        </Form>
                    </div>
                </div>
            </div>
        );
    }
}


export { Settings, default_settings };