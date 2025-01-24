#/bin/python3
import geopandas as gpd
import pandas as pd
from shapely.geometry import Point
from pyproj import CRS, Transformer

# Lese CSV
csv_path = 'data/swissNAMES3D_PLY_relevant_fields.csv'
csv_data = pd.read_csv(csv_path, sep=';', encoding='utf-8')

# Definiere das Quell-CRS (CSV-Daten)
source_crs = CRS("EPSG:2056")  # LV95

# Lese Shapefile mit Kantonen der Schweiz
cantone_path = 'data/swissBOUNDARIES3D_1_5_TLM_KANTONSGEBIET.shp'
cantone_gdf = gpd.read_file(cantone_path)

# Lese das Ziel-CRS aus dem Shapefile
print(cantone_gdf.crs)

print("Verfügbare Felder im Shapefile:")
print(cantone_gdf.columns)

print(cantone_gdf.info())

pd.set_option('display.max_columns', None)  # Zeigt alle Spalten
pd.set_option('display.width', None)  # Verwendet die volle Breite des Terminals
pd.set_option('display.max_rows', None)  # Zeigt alle Zeilen

# Dann geben Sie die Daten aus
print(cantone_gdf.drop(columns=['geometry']))

exit(0)

