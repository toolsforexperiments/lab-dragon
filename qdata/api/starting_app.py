import os
import connexion
from connexion.middleware import MiddlewarePosition
from starlette.middleware.cors import CORSMiddleware


app = connexion.App(__name__, specification_dir='./')
app.add_middleware(
    CORSMiddleware,
    position=MiddlewarePosition.BEFORE_EXCEPTION,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_api('API_specification.yaml')


# TODO: Add a call on the api for the client to know what are the supported media types.
#  This might not be necessary since the client should probably have specific code on how it handles different media
#  types.

if __name__ == '__main__':
    host = os.getenv('TRAEFIK_HOST')
    app.run(host=host, port=8000)

