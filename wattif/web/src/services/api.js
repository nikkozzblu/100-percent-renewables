import { apiUrl } from './config';
import { handleResponse, requestOptions } from '../helpers'

export const apiService = {
    countries,
    years,
    calculate,
    estimate,
    optimize
};

function countries() {
    const options = requestOptions('GET');
    return fetch(apiUrl + `/countries/`, options)
        .then(handleResponse);
}

function years(country) {
    const options = requestOptions('GET');
    return fetch(apiUrl + `/years/` + country, options)
        .then(handleResponse);
}

function estimate(country, year) {
    const options = requestOptions('GET');
    return fetch(apiUrl + `/estimate/` + country + `/` + year, options)
        .then(handleResponse);
}


function calculate(country, year, settings) {
    const options = requestOptions('POST', settings);
    return fetch(apiUrl + `/calculate/` + country + `/` + year, options)
        .then(handleResponse);
}

function optimize(country, year, settings) {
    const options = requestOptions('POST', settings);
    return fetch(apiUrl + `/optimize/` + country + `/` + year, options)
        .then(handleResponse);
}