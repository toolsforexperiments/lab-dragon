import os
from pathlib import Path

import connexion
from dotenv import load_dotenv
from connexion.middleware import MiddlewarePosition
from starlette.middleware.cors import CORSMiddleware

load_dotenv()

target = Path("../test/tmp")

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


if __name__ == '__main__':
    host = os.getenv('HOST')
    app.run(host=host, port=8000)