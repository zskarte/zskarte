

#/bin/bash
# prepare variables and login:
apiUrl="http://localhost:1337"
styleUrlEntrances="${apiUrl}/uploads/entrances_mapboxstyle_d519ba023f.json"
styleUrlSwissNAMES3D="${apiUrl}/uploads/swiss_NAMES_3_D_PLY_mapboxstyle_0342e0dc91.json"
uploadFolderIdEntrances=3
uploadFolderIdSwissNAMES3D=4
jwtAdminToken=FILL_IN_API_TOKEN_HERE

if [[ -z "${jwtAdminToken}" ]] || [[ "${jwtAdminToken}" = "FILL_IN_API_TOKEN_HERE" ]]; then
    echo "no jwtAdminToken available enter login data"
    source ./loginFuncs.sh
    jwtAdminToken=$(adminLogin)
    [[ $? -ne 0 ]] && exit $?
fi

#hausNumbers / entrances:
#------------------------
mkdir -p madd
cd madd
#fetch and extract official swiss database, see https://www.housing-stat.ch/de/madd/public.html#daten_herunterladen
for canton in ag ai ar be bl bs fr ge gl gr ju lu ne nw ow sg sh so sz tg ti ur vd vs zg zh; do
    if [[ ! -e ${canton}.zip ]]; then
        curl -J -O "https://public.madd.bfs.admin.ch/${canton}.zip"
    fi
    unzip -o -j ${canton}.zip entrances.geojson
    mv entrances.geojson ../entrances/entrances_${canton}.geojson
done


#upload entrence files and create map-layers from them:
#------------------------------------------------------

cd ../entrances
for canton in ag ai ar be bl bs fr ge gl gr ju lu ne nw ow sg sh so sz tg ti ur vd vs zg zh; do
    uploadResponse=$(curl "${apiUrl}/upload" -H "Authorization: Bearer ${jwtAdminToken}" -F "files=@entrances_${canton}.geojson" -F 'fileInfo={"name":"entrances_'${canton}'.geojson","folder":"'${uploadFolderIdEntrances}'"}')
    #echo "${uploadResponse}" | jq
    dataUrl=$(echo "${uploadResponse}" | jq -r '.[0].url')
    if [[ "${dataUrl#http}" == ${dataUrl} ]]; then
        dataUrl="${apiUrl}${dataUrl}"
    fi

    cantonUC=$(echo "${canton}" | tr 'a-z' 'A-Z')
    mapLayerData=$(cat entrances_maplayer.json | sed "s|%%label%%|Hausnummern / Addressuche (${cantonUC})|" | sed "s|%%dataUrl%%|${dataUrl}|" | sed "s|%%styleUrl%%|${styleUrlEntrances}|")
    createResponse=$(curl -s "${apiUrl}/content-manager/collection-types/api::map-layer.map-layer" -X POST -H 'Content-Type: application/json' -H "Authorization: Bearer ${jwtAdminToken}" --data-raw "${mapLayerData}")
    #echo "${createResponse}" | jq
    layerId=$(echo "${createResponse}" | jq -r '.data.id')
    echo "${canton}=${layerId}" >> canton_layer_mapping.env
done
cd ..




#region/town names:
#------------------
cd swissNAMES3D
mkdir -p output
#get newest file:
#https://www.swisstopo.admin.ch/de/landschaftsmodell-swissnames3d#swissNAMES3D---Download
#currently new files are uploaded in june
year=2024
if [[ ! -e "swissnames3d_${year}_2056.csv.zip" ]]; then
    curl -J -O https://data.geo.admin.ch/ch.swisstopo.swissnames3d/swissnames3d_${year}/swissnames3d_${year}_2056.csv.zip
fi

unzip -o -j swissnames3d_${year}_2056.csv.zip swissNAMES3D_PLY.csv

./extractRequiredColumns.sh


# #upload single file for whole switzerland:
# #-----------------------------------------
# 
# uploadResponse=$(curl "${apiUrl}/upload" -H "Authorization: Bearer ${jwtAdminToken}" -F "files=@swissNAMES3D_PLY_removed_cols.csv" -F 'fileInfo={"name":"entrances_swissNAMES3D_PLY_removed_cols.csv","folder":"'${uploadFolderIdSwissNAMES3D}'"}')
# #echo "${uploadResponse}" | jq
# dataUrl=$(echo "${uploadResponse}" | jq -r '.[0].url')
# if [[ "${dataUrl#http}" == ${dataUrl} ]]; then
#     dataUrl="${apiUrl}${dataUrl}"
# fi
# 
# mapLayerData=$(cat region_maplayer.json | sed "s|%%label%%|swissNAMES3D_PLY Siedlungsgebiete|" | sed "s|%%dataUrl%%|${dataUrl}|" | sed "s|%%styleUrl%%|${styleUrlSwissNAMES3D}|")
# createResponse=$(curl -s "${apiUrl}/content-manager/collection-types/api::map-layer.map-layer" -X POST -H 'Content-Type: application/json' -H "Authorization: Bearer ${jwtAdminToken}" --data-raw "${mapLayerData}")
# layerId=$(echo "${createResponse}" | jq -r '.data.id')
# echo "full=${layerId}" >> canton_layer_mapping.env



#get borders of cantons:
#https://www.swisstopo.admin.ch/de/landschaftsmodell-swissboundaries3d
year=2025
month=01
if [[ ! -e "swissboundaries3d_${year}-${month}_2056_5728.shp.zip" ]]; then
    curl -J -O https://data.geo.admin.ch/ch.swisstopo.swissboundaries3d/swissboundaries3d_${year}-${month}/swissboundaries3d_${year}-${month}_2056_5728.shp.zip
fi
unzip -o -j swissboundaries3d_${year}-${month}_2056_5728.shp.zip swissBOUNDARIES3D_1_5_TLM_KANTONSGEBIET.*

if [[ -z "$(ls output/*)" ]]; then
    #use docker container to extract canton based data / points from swiss file
    cd docker
    docker build -t split-regions:latest .
    cd ..

    docker run --mount type=bind,source="$(pwd)",target=/app/data --mount type=bind,source="$(pwd)/output",target=/app/output split-regions:latest
fi

for canton in 'AG=Aargau' 'AI=Appenzell Ausserrhoden' 'AR=Appenzell Innerrhoden' 'BL=Basel-Landschaft' 'BS=Basel-Stadt' 'BE=Bern' 'FR=Fribourg' 'GE=Genève' 'GL=Glarus' 'GR=Graubünden' 'JU=Jura' 'LU=Luzern' 'NE=Neuchâtel' 'NW=Nidwalden' 'OW=Obwalden' 'SG=Schaffhausen' 'SZ=Schwyz' 'SO=Solothurn' 'SG=St. Gallen' 'TG=Thurgau' 'TI=Ticino' 'UR=Uri' 'VD=Valais' 'VS=Vaud' 'ZG=Zug' 'ZH=Zürich'; do
    cantonUC="${canton%%=*}"
    cantonName="${canton#*=}"

    uploadResponse=$(curl "${apiUrl}/upload" -H "Authorization: Bearer ${jwtAdminToken}" -F "files=@output/${cantonName}.csv" -F 'fileInfo={"name":"swissNAMES3D_PLY_removed_cols_'${cantonUC}'.csv","folder":"'${uploadFolderIdSwissNAMES3D}'"}')
    #echo "${uploadResponse}" | jq
    dataUrl=$(echo "${uploadResponse}" | jq -r '.[0].url')
    if [[ "${dataUrl#http}" == ${dataUrl} ]]; then
        dataUrl="${apiUrl}${dataUrl}"
    fi

    mapLayerData=$(cat region_maplayer.json | sed "s|%%label%%|swissNAMES3D_PLY Siedlungsgebiete (${cantonUC})|" | sed "s|%%dataUrl%%|${dataUrl}|" | sed "s|%%styleUrl%%|${styleUrlSwissNAMES3D}|")
    createResponse=$(curl -s "${apiUrl}/content-manager/collection-types/api::map-layer.map-layer" -X POST -H 'Content-Type: application/json' -H "Authorization: Bearer ${jwtAdminToken}" --data-raw "${mapLayerData}")
    layerId=$(echo "${createResponse}" | jq -r '.data.id')
    echo "${cantonUC}=${layerId}" >> canton_layer_mapping.env
done
cd ..
