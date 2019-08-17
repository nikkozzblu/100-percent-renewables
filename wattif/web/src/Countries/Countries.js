import React from 'react';

import { apiService } from '../services';

import './Countries.css'
import {Loader} from '../helpers'

class Countries extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            country: false,
            countrySelect:false,
            loading: true,
            error: '',
            countries: {}
        };

        this.selectCountry = this.selectCountry.bind(this);
        this.unselectCountry = this.unselectCountry.bind(this);
        this.hideselectCountry = this.hideselectCountry.bind(this);
        this.loadCountries();
    }

    loadCountries() {
        apiService.countries().then(data =>
            this.setState({ loading: false, error: '', countries: data })
            , error => this.setState({ error, loading: false }));
    }

    selectCountry(c) {
        let country = this.state.countries[c];
        country.code = c;
        this.setState({ country: country, countrySelect:false });
        this.props.onSelect(c);
    }
    unselectCountry(e)
    {
        e.stopPropagation();
        this.setState({ countrySelect: true });
    }
    hideselectCountry(e)
    {

        e.stopPropagation();
        this.setState({ countrySelect: false });
    }

    render() {
        const { country, countrySelect, countries, loading, error } = this.state;

        var items = Object.keys(countries).map(code => {
            let country = countries[code];

            return (
                <Country flag={country.flag} name={country.name} key={code}
                    value={code} select={this.selectCountry} />
            );
        });

        return (
            <div>
                {country &&
                    <div className="SelectedCountry tip" onClick={this.unselectCountry}>
                        <img src={country.flag} alt={country.code}></img>
                        <span aria-hidden="true">{country.name}</span>
                    </div>
                }
                {(!country || countrySelect) &&
                    <div className="Countries holder">
                        {!countrySelect &&
                        <h2>Select a country</h2>
                        }
                        {countrySelect &&
                        <div className="spacer"></div>
                        }
                        {loading &&
                            <Loader />
                        }
                        <ul> {items} </ul>
                        {countrySelect &&
                        <div className='tip closer' onClick={this.hideselectCountry}>Close</div>
                        }
                    </div>
                }
            </div>
        );
    }
}

class Country extends React.Component {
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }
    onClick() {
        var value = this.props.value;
        this.props.select(value);
    }
    render() {
        return (
            <li className="Country" onClick={this.onClick}>
                <div>
                    <img src={this.props.flag} alt={this.props.value}></img>
                    <span aria-hidden="true">{this.props.name}</span>
                </div>
            </li>
        );
    }
}


export { Countries }; 