import React from 'react';

import { apiService } from '../services';
import './Years.css'
import { Loader } from '../helpers'

class Years extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            year: false,
            yearSelect: false,
            loading: true,
            error: '',
            years: []
        };

        this.selectYear = this.selectYear.bind(this);
        this.unselectYear = this.unselectYear.bind(this);
        this.hideselectYear = this.hideselectYear.bind(this);
        this.loadYears();
    }

    loadYears() {
        apiService.years(this.props.country).then(data =>
            this.setState({ loading: false, error: '', years: data })
            , error => this.setState({ error, loading: false }));
    }

    selectYear(year) {
        this.setState({ year: year, yearSelect: false });
        this.props.onSelect(year);
    }
    unselectYear() {
        this.setState({ yearSelect: true });
    }
    hideselectYear() {
        this.setState({ yearSelect: false });
    }

    render() {
        const { year, yearSelect, years, loading, error } = this.state;

        var items = years.map(year => {
            return (
                <Year year={year} key={year}
                    value={year} select={this.selectYear} />
            );
        });

        return (
            <div>
                {year &&
                    <div className="SelectedYear tip" onClick={this.unselectYear}>
                        <span aria-hidden="true">{year}</span>
                    </div>
                }
                {(!year || yearSelect) &&
                    <div className="Years holder">

                        {!yearSelect &&

                            <h2>Select a year</h2>
                        }
                        {yearSelect &&
                            <div className="spacer"></div>
                        }
                        {loading &&
                            <Loader />
                        }
                        <ul> {items} </ul>
                        {yearSelect &&
                            <span className='tip closer' onClick={this.hideselectYear}>close</span>
                        }
                    </div>
                }
            </div>
        );
    }
}


class Year extends React.Component {
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
            <li className="Year " onClick={this.onClick}>
                <div>
                    <span aria-hidden="true">{this.props.year}</span>
                </div>
            </li>
        );
    }
}


export { Years }; 