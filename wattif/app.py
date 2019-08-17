import json
import os

from flask import (
    Flask, jsonify, render_template, request, send_from_directory
)

from flask_cors import CORS

from models import calculate_costs, estimate_capacities, optimize_capacities

# Create the application instance
app = Flask(__name__, template_folder='templates', static_folder='web/build/')
CORS(app)

# Serve React App
@app.route('/', defaults={'path': ''})
@app.route('/<path>')
def serve(path):
    if path != '' and os.path.exists(app.static_folder + path):
        return send_from_directory(app.static_folder, path)
    else:
        print(path, 'not exists')
        return send_from_directory(app.static_folder, 'index.html')


@app.route('/api/countries/')
def countries():
    """
    This function return the list of available countries with data

    :return:        the list of available countries as JSON
    """
    countries = []
    with open('countries.json') as json_file:
        data = json.load(json_file)
        countries = list(set([f.split('_')[0] for f in os.listdir('../data')
                              if f.endswith('.csv')]))
        countries = {c: data[c] for c in sorted(countries) if c in data}
    return jsonify(countries)


@app.route('/api/years/<country>')
def years(country):
    """
    This function return the list of available years with data for a specified
    country

    :country:       the selected country

    :return:        the list of available countries as JSON
    """
    years = list(set([f.split('_')[1].split('.')[0] for f in os.listdir('../data')
                      if f.startswith(country) and f.endswith('.csv')]))
    years = sorted(years, reverse=True)
    return jsonify(years)


@app.route('/api/estimate/<country>/<year>', methods=['GET'])
def estimate(country, year):
    """
    This function return an estimate of required capacities


    :country:       the selected country
    :year:          the selected year

    :return:        the list of available countries as JSON
    """

    results = estimate_capacities(country, year)
    return jsonify(results)


@app.route('/api/calculate/<country>/<year>', methods=['POST'])
def calculate(country, year):
    """
    This function return the calculation given the options


    :country:       the selected country
    :year:          the selected year

    :return:        the list of available countries as JSON
    """

    options = request.get_json()
    results = calculate_costs(country, year, options)

    return jsonify(results)


@app.route('/api/optimize/<country>/<year>', methods=['POST'])
def optimize(country, year):
    """
    This function return the calculation given the options


    :country:       the selected country
    :year:          the selected year

    :return:        the list of available countries as JSON
    """

    options = request.get_json()
    results = optimize_capacities(country, year, options)

    return jsonify(results)


# If we're running in stand alone mode, run the application
if __name__ == '__main__':
    app.run(debug=True)
