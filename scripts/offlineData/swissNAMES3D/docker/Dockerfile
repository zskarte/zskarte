FROM ghcr.io/osgeo/gdal:ubuntu-small-latest

RUN apt-get update && apt-get -y install python3-pip --fix-missing

WORKDIR /app

COPY requirements.txt /app/

RUN pip install --break-system-packages --no-cache-dir -r requirements.txt

COPY *.py ./

CMD ["python", "extract.py"]

