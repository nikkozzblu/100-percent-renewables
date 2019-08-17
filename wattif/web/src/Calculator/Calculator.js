import React, { Component } from 'react';

import { Countries } from '../Countries';
import { Years } from '../Years';
import { Settings, default_settings } from '../Settings'
import { Results } from '../Results'

import { apiService } from '../services'
import { formatPower } from '../helpers'

class Calculator extends Component {
    constructor(props) {
        super(props);

        this.state = {
            country: false,
            year: false,
            settings: default_settings(),
            results: false,

            conso: false,
            wind_load: false,
            solar_load: false,

            reset_settings: 0,
        };
        this.handleSelectCountry = this.handleSelectCountry.bind(this);
        this.handleSelectYear = this.handleSelectYear.bind(this);
        this.handleCalculate = this.handleCalculate.bind(this);
        this.handleOptimize = this.handleOptimize.bind(this);
        this.loadSettings = this.loadSettings.bind(this);
        this.setSettings = this.setSettings.bind(this);

    }
    handleSelectCountry(country) {
        this.setState({ country: country, year: false, results: false });
        let sets = this.state.settings;
        this.state.settings.wind_capa = false
        this.setSettings(sets);
    }
    handleSelectYear(year) {
        this.setState({ year: year, results: false });
        this.loadSettings(this.state.country, year);
    }
    handleCalculate(options) {
        this.setState({ results: false });

        return apiService.calculate(this.state.country, this.state.year, options)
            .then(data => this.setState({ results: data }));
    }
    handleOptimize(options) {
        this.setState({ results: false });

        return apiService.optimize(this.state.country, this.state.year, options)
            .then(data => {
                let sets = this.state.settings;
                for (var k in data)
                    if (sets[k])
                        sets[k] = data[k]
                this.setState({ results: data, settings: sets, reset_settings: this.state.reset_settings + 1 })
            });
    }
    loadSettings(country, year) {
        if (this.state.settings.wind_capa !== false)
            return;
        apiService.estimate(country, year).then(data => {
            let opt = this.state.settings || default_settings;
            opt['wind_capa'] = data.wind_capa;
            opt['solar_capa'] = data.solar_capa;
            opt['storage_capa'] = data.storage_capa;
            this.setState({ options: opt, conso: data.conso_avg, wind_load: data.wind_avg, solar_load: data.solar_avg })
        })
    }
    setSettings(settings) {
        this.setState({ options: settings });
    }

    render() {
        const { country, year, settings, conso, wind_load, solar_load, results } = this.state;

        return (
            <div>
                <Countries onSelect={this.handleSelectCountry} />
                {
                    country &&
                    <Years country={country} key={country} onSelect={this.handleSelectYear} />
                }
                {
                    country && year &&
                    <div className='centerer'>
                        <div className="small-text pad-top">Mean consumption : {formatPower(conso)}Wh, Wind load factor : {Math.round(wind_load * 100)}%, Solar load factor : {Math.round(solar_load * 100)}%</div>
                    </div>
                }
                {
                    country && year &&
                    <Settings country={country} year={year} key={country + year}
                        settings={settings} optimize={this.handleOptimize} setSettings={this.setSettings}
                        calculate={this.handleCalculate} />
                }
                {
                    results &&
                    <Results results={results} key={results} />
                }
            </div>
        );
    }
}

export { Calculator };
