import pandas as pd


def estimate_capacities(country, year):
    data = pd.read_csv('../data/%s_%s.csv' % (country, year))

    results = {}
    results['conso_avg'] = float(data['Consumption (MWh)'].mean())
    results['wind_avg'] = float(data['Wind Charge Factor'].mean())
    results['solar_avg'] = float(data['Solar Charge Factor'].mean())
    results['wind_capa'] = int(results['conso_avg'] / results['wind_avg'] / 1e3)
    results['solar_capa'] = int(results['conso_avg'] /
                                results['solar_avg'] / 4 / 1e3)
    results['storage_capa'] = int(results['conso_avg'] * 24 * 8 / 1e3)
    return results


def calculate_costs(country, year, options, adjust_webunits=True):
    options = default_options(options, adjust_webunits)

    data = pd.read_csv('../data/%s_%s.csv' % (country, year)
                       ).set_index(['Month', 'Day', 'Hour'])

    data['Wind production (MWh)'] = data['Wind Charge Factor'] * \
        options['wind_capa']
    data['Solar production (MWh)'] = data['Solar Charge Factor'] * \
        options['solar_capa']
    data['REN production (MWh)'] = data['Wind production (MWh)'] + \
        data['Solar production (MWh)']
    data['Balance (MWh)'] = data['REN production (MWh)'] - data['Consumption (MWh)']
    print(data.describe())
    results = {}

    currently_stored = options['storage_capa'] / 2
    stored = []
    missing = []
    for index, row in data.iterrows():
        currently_stored = \
            min(currently_stored + row['Balance (MWh)'] *
                (options['storage_efficiency'] if row['Balance (MWh)'] >
                 0 else 1 / options['storage_efficiency']),
                options['storage_capa'])
        if currently_stored < options['storage_capa'] * options['storage_minimum']:
            missing += [options['storage_capa'] *
                        options['storage_minimum'] - currently_stored]
            currently_stored = options['storage_capa'] * options['storage_minimum']
        else:
            missing += [0]
        stored += [currently_stored]
    data['Stored (MWh)'] = stored
    data['Missing (MWh)'] = missing

    wind_yearly_cost = (options['costs']['wind_capex'] +
                        options['costs']['wind_opex']) * options['wind_capa']
    solar_yearly_cost = (options['costs']['solar_capex'] +
                         options['costs']['solar_opex']) * options['solar_capa']
    grid_yearly_cost = options['costs']['grid_capex'] * \
        (options['wind_capa'] + options['solar_capa'])

    storage_cycles_peryear = pd.cut(
        data['Stored (MWh)'] / storage_capacity * 100, bins=range(100)).value_counts().mean()

    storage_yearly_cost = (options['costs']['storage_capex'] /
                           options['costs']['storage_cycles'] *
                           storage_cycles_peryear + options['costs']['storage_opex']
                           ) * options['storage_capa']

    total_yearly_cost = wind_yearly_cost + solar_yearly_cost + \
        grid_yearly_cost + storage_yearly_cost
    per_kwh_cost = total_yearly_cost / data.sum()['Consumption (MWh)'] * 1e6 / 1e3

    results['conso_avg'] = float(data['Consumption (MWh)'].mean())
    results['wind_avg'] = float(data['Wind Charge Factor'].mean())
    results['solar_avg'] = float(data['Solar Charge Factor'].mean())

    results['missing'] = float(data['Missing (MWh)'].sum() /
                               data['Consumption (MWh)'].sum())
    results['missing_capa'] = float(data['Missing (MWh)'].max())
    results['wind_cost'] = float(wind_yearly_cost)
    results['solar_cost'] = float(solar_yearly_cost)
    results['grid_cost'] = float(grid_yearly_cost)
    results['storage_cost'] = float(storage_yearly_cost)
    results['storage_cycles_peryear'] = float(storage_cycles_peryear)

    results['yearly_cost'] = float(total_yearly_cost)
    results['per_kwh_cost'] = float(per_kwh_cost)

    return results


from pulp import *


def optimize_capacities(country, year, options):
    storage_cycles_peryear = 60
    options = default_options(options)

    data = pd.read_csv('../data/%s_%s.csv' % (country, year)
                       ).set_index(['Month', 'Day', 'Hour'])

    prob = LpProblem("Minimum cost", LpMinimize)
    nb_hours = len(data)  # 1000
    # Optimized variables definition
    wind_capa = LpVariable("Wind capacity GW", options.get(
        'wind_min'), options.get('wind_max'), cat='Continous')
    solar_capa = LpVariable("Solar capacity GW", options.get(
        'solar_min'), options.get('solar_max'), cat='Continous')
    storage_capa = LpVariable("Storage capacity GWh", options.get(
        'storage_min'), options.get('storage_max'), cat='Continous')

    # We will pass stored as capacity stored at an hour t as a optimization parameter.
    # In order to relax the constraint on production we also allow for a parameter losses
    # that represents at an instant t  the amount of production we haven't been able to store
    stored = []
    losses = []
    charge = []
    discharge = []
    for i in range(0, nb_hours):
        stored.append(LpVariable("stored(" + str(i) + ")", 0, cat='Continous'))
        losses.append(LpVariable("losses(" + str(i) + ")", 0, cat='Continous'))
        charge.append(LpVariable("charge(" + str(i) + ")", 0, cat='Continous'))
        discharge.append(LpVariable(
            "discharge(" + str(i) + ")", None, 0, cat='Continous'))

    def total_yearly_cost():
        wind_yearly_cost = (
            options['costs']['wind_capex'] + options['costs']['wind_opex']) * wind_capa * 1000
        solar_yearly_cost = (
            options['costs']['solar_capex'] + options['costs']['solar_opex']) * solar_capa * 1000
        grid_yearly_cost = options['costs']['grid_capex'] * \
            (wind_capa + solar_capa) * 1000
        storage_yearly_cost = (options['costs']['storage_capex'] /
                               options['costs']['storage_cycles'] *
                               storage_cycles_peryear +
                               options['costs']['storage_opex']) * storage_capa * 1000 * 1.2

        return wind_yearly_cost + solar_yearly_cost + grid_yearly_cost + \
            storage_yearly_cost

    # Function to minimize
    prob += total_yearly_cost(), "Cost"

    wind_cf = data['Wind Charge Factor'].values
    solar_cf = data['Solar Charge Factor'].values
    consos = data['Consumption (MWh)'].values / 1000

    def balance(i):
        if i > 0:
            return stored[i] - stored[i - 1]
        else:
            return stored[0] - storage_capa / 2

    def system_equilibrium(i):
        return wind_cf[i] * wind_capa + solar_cf[i] * solar_capa - consos[i] +\
            charge[i] * options['storage_efficiency'] + discharge[i] * \
            1 / options['storage_efficiency'] - losses[i]

    # Constraints
    for i in range(1, nb_hours):
        # system equilibrium at all time
        prob += system_equilibrium(i) == 0
        # storage won't go above capacity and not below 5%
        prob += stored[i] <= storage_capa
        prob += stored[i] >= 0.055 * storage_capa

        prob += balance(i) == charge[i] + discharge[i]
        prob += charge[i] >= 0
        prob += discharge[i] <= 0
        prob += balance(i) <= charge[i]
        prob += balance(i) >= discharge[i]

    prob.solve()

    def find_var_index(var_string):
        return int(''.join([s for s in var_string if s.isdigit()]))

    for v in prob.variables():
        if v.name == 'Storage_capacity_GWh':
            storage_best = v.varValue
        elif v.name == 'Solar_capacity_GW':
            solar_best = v.varValue
        elif v.name == 'Wind_capacity_GW':
            wind_best = v.varValue

    options['wind_capa'] = wind_best
    options['solar_capa'] = solar_best
    options['storage_capa'] = storage_best

    results = calculate_costs(country, year, options, False)
    results['wind_capa'] = wind_best
    results['solar_capa'] = solar_best
    results['storage_capa'] = storage_best
    return results


def default_options(options, from_web=True):
    options['storage_efficiency'] = float(options.get('storage_efficiency') or 0.9)
    options['storage_minimum'] = float(options.get('storage_minimum') or 0.05)

    options['costs'] = options.get('costs') or {}
    options['costs']['wind_lifetime'] = float(
        options['costs'].get('wind_lifetime') or 25)
    options['costs']['wind_capex'] = float(options['costs'].get('wind_capex') or 1.5)
    options['costs']['wind_opex'] = float(options['costs'].get('wind_opex') or 0.045)

    options['costs']['solar_lifetime'] = float(
        options['costs'].get('solar_lifetime') or 25)
    options['costs']['solar_capex'] = float(
        options['costs'].get('solar_capex') or 1.0)
    options['costs']['solar_opex'] = float(
        options['costs'].get('solar_opex') or 0.008)

    options['costs']['grid_lifetime'] = float(
        options['costs'].get('grid_lifetime') or 50)
    options['costs']['grid_capex'] = float(options['costs'].get('grid_capex') or 1.5)

    options['costs']['storage_capex'] = float(
        options['costs'].get('storage_capex') or 0.2)

    options['costs']['storage_opex'] = float(
        options['costs'].get('storage_opex') or 0.000065)
    options['costs']['storage_cycles'] = float(
        options['costs'].get('storage_cycles') or 1500)

    options['wind_capa'] = float(options['wind_capa']) * 1e3
    options['solar_capa'] = float(options['solar_capa']) * 1e3
    options['storage_capa'] = float(options['storage_capa']) * 1e3

    # For optim
    options['wind_min'] = float(options.get('wind_min') or 0)
    if options.get('wind_max'):
        options['wind_max'] = float(options.get('wind_max'))
    options['solar_min'] = float(options.get('solar_min') or 0)
    if options.get('solar_max'):
        options['solar_max'] = float(options.get('solar_max'))
    options['storage_min'] = float(options.get('storage_min') or 0)
    if options.get('storage_max'):
        options['storage_max'] = float(options.get('storage_max'))

    if from_web:
        options['costs']['wind_capex'] /= options['costs']['wind_lifetime']
        options['costs']['solar_capex'] /= options['costs']['solar_lifetime']
        options['costs']['grid_capex'] /= options['costs']['grid_lifetime']
        options['costs']['wind_opex'] = float(options['costs']['wind_opex']) / 1e3
        options['costs']['solar_opex'] = float(options['costs']['solar_opex']) / 1e3
        options['costs']['storage_opex'] = float(
            options['costs']['storage_opex']) / 1e3

        options['storage_efficiency'] = options['storage_efficiency'] / 100

    return options
