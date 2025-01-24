#!/bin/bash
#extract required columns from file:
csvDelim=";"
input_file="swissNAMES3D_PLY.csv"
output_file="swissNAMES3D_PLY_relevant_fields.csv"
columns_to_extract=("OBJEKTART" "OBJEKTKLASSE_TLM" "EINWOHNERKATEGORIE" "NAME" "E" "N" "Z")

# Extrahiere col numbers based on name
header=$(head -n 1 "$input_file")
column_numbers=$(echo "$header" | awk -F"$csvDelim" -v cols="${columns_to_extract[*]}" '
BEGIN {split(cols, arr, " ")}
{
    for (i=1; i<=NF; i++) {
        for (j in arr) {
            if ($i == arr[j]) {
                printf "%d,", i
            }
        }
    }
}' | sed 's/,$//')

# extract corresponding columns from file
cut -d"$csvDelim" -f"$column_numbers" "$input_file" > "$output_file"

