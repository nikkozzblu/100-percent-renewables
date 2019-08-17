# 100% Renewables electricity for Europe

This repository aims to be a collaborative project to study scenarii around the possibility of running Europeans country electricity supply only on renewables

http://wattif.pythonanywhere.com

## Current stage
A flask/reactjs application for evaluating the impacts of electrical system setup for european countries
- Only onshore wind and solar are considered as production units
- Storage is modelled in a generic way but mose of assumptions and costs are derived from Lithium-Ion batteries

## How to contribute
At this stage contributions would ideally take the form of notebooks
An example/base jupyter notebook exploring the particular case of France in year 2015 can be found in [https://github.com/nikkozzblu/100-percent-renewables/blob/master/notebooks/Impacts%20of%20100%25%20renewables.ipynb](here)
 
### Install anaconda & dependencies
See https://docs.anaconda.com/anaconda/install/

Activate conda virtual default environement (or create a specific one) and install Pulp linear optimizer 

```
> conda activate
> pip install pulp
```

### Prepare datasets
Clone this repository and download the following dataset in the data directory:

- Hourly Consumption Data (ENTSOE): https://docstore.entsoe.eu/Documents/Publications/Statistics/Monthly-hourly-load-values_2006-2015.xlsx
- Hourly Wind Capacity Factor (EUROPA-EMHIRES): http://setis.ec.europa.eu/sites/default/files/EMHIRES_DATA/EMHIRES_WIND_COUNTRY_June2019.zip
- Hourly Solar Capacity Factor (EUROPA-EMHIRES): https://setis.ec.europa.eu/sites/default/files/EMHIRES_DATA/Solar/EMHIRESPV_country_level.zip

Unzip them in the data directory

Start the jupyter notebook engine

```
> jupyter notebook
```

Open the "Load data" notebook and run all the cells.
If everything goes smoothly you should now have 275 CSV files in your "data" directory combining the 3 dataset by country and by year

You can now play with the "Impacts of 100% renewables" notebook and try it for different countries/years

### What's next
This is just an initial step for this project that I run on my free time.
Contributions are really welcomed in the form of Notebooks at this stage to:
- Simulate other sources of renewables production units:
  - Hydro
  - Biomass
  - Offshore wind
  - Solar thermal
  - Geothermal
  - Tidal
  - Waves
- Refine the grid cost estimate
- Cross borders exchanges
- EROI costs in terms of energy investment 
- Introduce new possibilities of assumptions on consumption:
  - Flexible loads
  - Electric cars fleets
- Add more datasets...

The next step for me would be to package those functions and interface it in the form of a minimalist web app to allow public to try various scenarii based on different country/year/cost assumptions
