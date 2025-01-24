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
if cantone_gdf.crs is None:
    cantone_gdf = cantone_gdf.set_crs("EPSG:2056")  # LV95
target_crs = cantone_gdf.crs

# Erstelle einen Transformer
transformer = Transformer.from_crs(source_crs, target_crs, always_xy=True)

# Erstelle GeoDataFrame mit transformierten Koordinaten für die Filterung
transformed_gdf = gpd.GeoDataFrame(
    csv_data,
    geometry=[Point(transformer.transform(x, y)) for x, y in zip(csv_data['E'], csv_data['N'])],
    crs=target_crs
)

# Erstelle originales GeoDataFrame im Quell-CRS für die Ausgabe
original_gdf = gpd.GeoDataFrame(
    csv_data,
    geometry=gpd.points_from_xy(csv_data.E, csv_data.N, crs=source_crs)
)

# Schleife über alle Kantone und exportiere CSV-Zeilen innerhalb der Grenze
for index, canton in cantone_gdf.iterrows():
    canton_name = canton['NAME']
    
    # Filtere Punkte innerhalb des Kantons mit transformierten Koordinaten
    mask = transformed_gdf.geometry.within(canton.geometry)
    
    # Verwende die Maske auf das originale GeoDataFrame und entferne die Geometry-Spalte
    points_in_canton = original_gdf[mask].drop(columns=['geometry'])
    
    # Ausgabe der gefilterten Daten als CSV im originalen Koordinatensystem
    output_path = f'output/{canton_name}.csv'
    points_in_canton.to_csv(output_path, index=False, sep=';')  # Setze Trennzeichen auf Semikolon
    
    print(f"Punkte für Kanton {canton_name} wurden in {output_path} gespeichert.")

print("Verarbeitung abgeschlossen.")

