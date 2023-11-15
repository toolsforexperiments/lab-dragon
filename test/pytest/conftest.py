import random
import shutil
import string
from pathlib import Path

import pytest
import numpy as np

# Tools from pfafflab
from labcore.measurement.sweep import Sweep, sweep_parameter
from labcore.measurement.record import record_as
from labcore.measurement.storage import run_and_save_sweep

import qdata
from qdata.generators.meta import generate_all_classes, delete_all_modules
from qdata.scripts.add_toml_to_data_dir import add_toml_to_data
from ..env_creator import create_full_test_env


def count_files(path):
    path = Path(path)

    if path.is_dir():
        return len([x for x in path.glob('*') if '.DS_Store' not in str(x) or '__pycache__' not in str(x)])


@pytest.fixture()
def refresh_modules():
    delete_all_modules()
    generate_all_classes()

@pytest.fixture()
def module_names(refresh_modules):

    nschemas = count_files(qdata.SCHEMASDIR)
    nmodules = count_files(qdata.MODULESDIR)

    if nmodules != nschemas:
        raise FileNotFoundError(f'Number of schemas ({nschemas}) does not match number of modules ({nmodules})')

    return [x.stem for x in qdata.MODULESDIR.glob('*.py') if '__init__' not in str(x)]


@pytest.fixture()
def generate_msmt_folder_structure(tmp_path=Path(r'tmp'), n_measurements=1, generate_each_run=False):
    if tmp_path.is_dir() and generate_each_run:
        shutil.rmtree(tmp_path)
        tmp_path.mkdir()

    folder_path = tmp_path.joinpath('data')
    if folder_path.is_dir():
        return None

    folder_path.mkdir()

    msmt_names = ["test_through",
                  "pulsed_resonator_spec",
                  "qA_power_rabi",
                  "qB_power_rabi",
                  "qA_T1",
                  "qB_T1",
                  "qA_T2_echo",
                  "qB_T2_echo",
                  "ssb_spec_pi",
                  ]

    images = ["koalas/baby_koala.png",
              "koalas/creepy_koala.jpg",
              "koalas/sleepy_koala.png",
              "pandas/baby_pandas.png",
              "pandas/Giant_panda.jpg",
              "pandas/panda_eating.png"]

    inner_sweep = sweep_parameter('x', np.linspace(0, 10), record_as(lambda x: x*2, 'z'))
    outer_sweep = sweep_parameter('y', np.linspace(0, 10))

    my_sweep = outer_sweep @ inner_sweep

    for name in msmt_names:
        for i in range(n_measurements):
            test_params = {f'param{j}': ''.join(random.choices(string.ascii_letters + string.digits, k=5)) for j
                           in range(1, 11)}
            path, data = run_and_save_sweep(sweep=my_sweep,
                                            data_dir=folder_path,
                                            name=name, test_parameters=test_params)
            image = random.choice(images)
            shutil.copy(Path("../testing_images").joinpath(image), path)

            if i == 0:
                star_path = path.joinpath('__star__.tag')
                star_path.touch()

    add_toml_to_data(folder_path)
    create_full_test_env(tmp_path, create_md=False, light_delete=True)


