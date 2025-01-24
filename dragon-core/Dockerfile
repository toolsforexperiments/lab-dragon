FROM python:3.11.7-slim

EXPOSE 8000

ENV TRAEFIK_HOST=localhost \
    VOLUME_ORIGIN=/home/pfafflab/data \
    LAIRS_DIRECTORY=/home/pfafflab/data \
    RESOURCE_PATH=/home/pfafflab/data/resource \
    USERS="{}" \
    API_URL_PREFIX=locahost/api \
    URL_HOST=localhost


RUN apt-get update && apt-get upgrade --yes
RUN yes | apt-get install git
RUN apt-get update -y && apt-get install -y gcc
RUN apt install libhdf5-dev --yes
RUN apt install libhdf5-serial-dev
RUN apt-get install -y pkg-config

RUN useradd --create-home pfafflab
USER pfafflab
WORKDIR /home/pfafflab

ENV PATH="/home/pfafflab/.local/bin:$PATH"

COPY --chown=pfafflab requirements.txt ./
RUN pip install --upgrade pip setuptools wheel
RUN pip install -r requirements.txt

COPY --chown=pfafflab . ./dragon-core


RUN pip install uvicorn
RUN pip install -e ./dragon-core/
RUN mkdir /home/pfafflab/data

WORKDIR /home/pfafflab/data

CMD uvicorn 'dragon_core.api.starting_app:app' --host 0.0.0.0 --forwarded-allow-ips '*'