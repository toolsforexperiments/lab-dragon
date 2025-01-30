import os
import re
import json
import copy
import random
import string
from pathlib import Path
from enum import Enum, auto
from typing import Optional, Union, Tuple

import nbformat
import markdown
from PIL import Image
from nbconvert import HTMLExporter
from werkzeug.utils import secure_filename
from flask import abort, make_response, send_file, current_app
from markdown.extensions.tables import TableExtension


from dragon_core.modules import Entity, Library, Notebook, Project, Task, Step, Bucket, Instance, DragonLair

from dragon_core.generators.meta import read_from_TOML
from dragon_core.components.content_blocks import SupportedContentBlockType, ContentBlock
from .converters import (MyMarkdownConverter,
                         CustomLinkExtension,
                         CustomHeadlessTableExtension,
                         set_api_url_prefix_and_host)


LOADING_FROM_ENV = False

try:
    # Config coming from starting script.
    CONFIG = current_app.config['API_config']

    ROOTPATH: Path = Path()

    LAIRSPATH: Path = Path(CONFIG['lairs_directory'])

    RESOURCEPATH: Path = Path(CONFIG['resource_path'])

except Exception as e:
    print(f"Getting config from environment dotenv")

    CONFIG = {}
    
    ROOTPATH: Path = Path()

    LAIRSPATH: Path = Path()

    RESOURCEPATH: Path = Path()
    LOADING_FROM_ENV = True
    

DRAGONLAIR: Optional[DragonLair] = None

# List of classes that can contain children. Only Project and Task can contain children for now.
PARENT_TYPES = []
ALL_TYPES = {}
# Holds all of the entity types that exists in the notebook
ENTITY_TYPES = set()

# dictionary holding all entity types (in string form) as keys and a list of classes (in the form of strings) of
# what type can be their children.
ALLOWED_PARENTAL_RELATIONS = {}

# Holds all of the entities that exists in the notebook, uuid as key and the entity as value.
INDEX = {}

# Holds as keys the paths to the TOML files and as values the UUID of the entity
PATH_TO_UUID_INDEX = {}
# Holds as keys the UUIDs of entities and as values the path to the TOML files
UUID_TO_PATH_INDEX = {}

INSTANCEIMAGE = {}


def set_initial_indices():
    global LOADING_FROM_ENV
    global CONFIG
    global ROOTPATH
    global LAIRSPATH
    global RESOURCEPATH
    global DRAGONLAIR
    global PARENT_TYPES
    global ALL_TYPES
    global ENTITY_TYPES
    global ALLOWED_PARENTAL_RELATIONS
    global INDEX
    global PATH_TO_UUID_INDEX
    global UUID_TO_PATH_INDEX
    global INSTANCEIMAGE

    if not LOADING_FROM_ENV:
        ROOTPATH = Path()

        LAIRSPATH = Path(CONFIG['lairs_directory'])

        RESOURCEPATH = Path(CONFIG['resource_path'])
        
        # Holds all of the users that exists in the notebook
        config_users = copy.copy(CONFIG['users'])

        # Used for images
        api_url_prefix = CONFIG['api_url_prefix']
        url_host = CONFIG['url_host']

    else:
        ROOTPATH = Path()

        LAIRSPATH = Path(os.getenv("LAIRS_DIRECTORY"))

        RESOURCEPATH = Path(os.getenv("RESOURCE_PATH"))
        
        # Holds all of the users that exists in the notebook
        config_users = copy.copy(os.getenv("USERS"))
        if isinstance(config_users, str):
            config_users = json.loads(config_users)

        # Used for images
        api_url_prefix = os.getenv("API_URL_PREFIX")
        url_host = os.getenv("URL_HOST")

    set_api_url_prefix_and_host(api_url_prefix, url_host)

    DRAGONLAIR = DragonLair(LAIRSPATH)

    # Handles users that are in the config.
    for user_email, user_name in config_users.items():
        if user_email not in DRAGONLAIR.users:
            DRAGONLAIR.add_user(user_email, user_name)

    # List of classes that can contain children. Only Project and Task can contain children for now.
    PARENT_TYPES = ["Library", "Notebook", "Project", "Task"]
    ALL_TYPES = {"Project": Project, "Task": Task, "Step": Step, "Library": Library, "Notebook": Notebook}
    # Holds all of the entity types that exists in the system.
    ENTITY_TYPES = {"Library", "Notebook", "Project", "Task", "Step"}

    # dictionary holding all entity types (in string form) as keys and a list of classes (in the form of strings) of
    # what type can be their children.
    ALLOWED_PARENTAL_RELATIONS = {
        "Library": ["Notebook"],
        "Notebook": ["Project"],
        "Project": ["Task", "Step"],
        "Task": ["Step"],
        "Step": [],
        "Bucket": ["Instance"],
        "Instance": []
    }

    INDEX = {}

    # Holds as keys the paths to the TOML files and as values the UUID of the entity
    PATH_TO_UUID_INDEX = {}
    # Holds as keys the UUIDs of entities and as values the path to the TOML files
    UUID_TO_PATH_INDEX = {}

    INSTANCEIMAGE = {}

    if not RESOURCEPATH.exists():
        RESOURCEPATH.mkdir(parents=True)


def reset():
    set_initial_indices()
    load_all_entities()


def get_indices():

    index = json.dumps(str(INDEX))

    ret = {'index': index, 'PATH_TO_UUID_INDEX': PATH_TO_UUID_INDEX}
    return ret


def create_path_entity_copy(ent: Entity) -> Entity:
    """
    Returns a copy of the passed entity with any mention to a UUID replaced with the paths of the TOML files for that
    entity. This is used to convert from working with paths to working with UUID

    :param ent: The entity you want a copy with the UUIDs replaced with paths :param index: A reverse of the
     PATH_TO_UUID_INDEX dictionary. This is used to convert from UUID to paths If not passed, it will be created on demand. The
     intention of having it optional is to avoid having to compute it every time this function is called if this
     function gets called multiple times for a single operation. :return:
    """
    copy_ent = copy.deepcopy(ent)
    if ent.parent in UUID_TO_PATH_INDEX:
        copy_ent.parent = UUID_TO_PATH_INDEX[ent.parent]

    children_paths = []
    for child in copy_ent.children:
        children_paths.append(UUID_TO_PATH_INDEX[child])
    copy_ent.children = children_paths

    # TODO: This should probably get removed
    order = []
    for item, item_type, deleted in copy_ent.order:
        if item_type == "entity":
            order.append((UUID_TO_PATH_INDEX[item], item_type, deleted))
        else:
            order.append((item, item_type, deleted))

    data_buckets = []
    for bucket in copy_ent.data_buckets:
        data_buckets.append(UUID_TO_PATH_INDEX[bucket])
    copy_ent.data_buckets = data_buckets

    return copy_ent


def content_block_path_to_uuid(content: str):

    def replacer(match):
        # Extract the text and file path from the match
        text = match.group(1)
        file_path = match.group(2)
        # If the file path is a key in the replacements dictionary, replace it
        # Otherwise, keep the original file path
        new_file_path = PATH_TO_UUID_INDEX.get(file_path, file_path)
        # Return the reconstructed string with the replacement file path
        return f'{text}({new_file_path})'

    # Regex pattern for file paths preceded by text in square brackets and enclosed in parentheses
    pattern = r'(\[.*?\])\(([\w\-.\/\s]+)\)'

    replaced_s = re.sub(pattern, replacer, content)
    return replaced_s


def _parse_and_validate_user(users_str) -> list[str]:
    if "'" in users_str or '"' in users_str:
        input_users = json.loads(users_str)
        input_users = [str(user).replace(" ", "") for user in input_users]
    elif isinstance(users_str, str):
        input_users = users_str.replace(" ", "").split(",")
    else:
        raise ValueError("User input is not a string")

    for user in input_users:
        if user not in DRAGONLAIR.users:
            abort(403, f"User '{user}' not found")
    return input_users


class MediaTypes(Enum):
    """
    Enum that contains the different types of images that are supported
    """
    png = auto()
    jpg = auto()
    md = auto()

    @classmethod
    def is_supported(cls, media_path):
        media_path = Path(media_path)
        if media_path.suffix[1:] in cls.__members__:
            return True
        else:
            return False


def add_ent_to_index(entity: Entity, entity_path: Union[Path, str]) -> None:
    """
    Adds an entity to all the necessary memory indices.

    :param entity: The entity which is being added to the index.
    :param entity_path: The path on disk to the TOML file that contains the entity.
    """

    if entity.ID not in INDEX:
        INDEX[entity.ID] = entity

    if entity_path not in PATH_TO_UUID_INDEX:
        PATH_TO_UUID_INDEX[str(entity_path)] = entity.ID

    if entity.ID not in UUID_TO_PATH_INDEX:
        UUID_TO_PATH_INDEX[entity.ID] = str(entity_path)


def initialize_bucket(bucket_path):
    """
    Function that initializes a bucket by adding it to the index and initializing the instances it contains.

    :param bucket: The bucket that is being initialized.
    """
    bucket = read_from_TOML(bucket_path)

    add_ent_to_index(bucket, bucket_path)

    for ins_path in bucket.path_to_uuid.keys():
        instance = read_from_TOML(ins_path)
        add_ent_to_index(instance, ins_path)

        # add images to the image index
        for img_path in instance.images:
            path = Path(img_path).resolve()
            # Only need to add image if it is an actual image, not html plot
            if path.suffix == '.jpg' or path.suffix == '.png':
                img = Image.open(path)
                INSTANCEIMAGE[img_path] = instance.ID
            elif path.suffix == '.html':
                pass

    return bucket


def process_content_blocks(entity):
    """
    Function that processes the content blocks of an entity and checks for markdown links.

    :param entity: The entity whose content blocks are being processed.
    """
    # Regular expression pattern for markdown links
    pattern = r'\[(.*?)\]\((.*?)\)'

    for block in entity.content_blocks:
        for content in block.content:
            if isinstance(content, str):
                matches = re.findall(pattern, content)
                for match in matches:
                    # Tries converting it to path and see if the path exists.
                    # Catches all failures because we don't want to crash if the path doesn't or isn't a path format.
                    try:
                        path = Path(match[1]).resolve()
                    except Exception as e:
                        continue
                    if path.exists() and path.suffix == '.jpg' or path.suffix == '.png':
                        img = Image.open(path)


def recursively_load_entity(entity_path: Path):
    """
    Loads an entity from a TOML file and recursively loads all of its children as well.
    """

    ent = read_from_TOML(entity_path)

    add_ent_to_index(ent, entity_path)

    child_list = []
    if len(ent.children) > 0:
        for child in ent.children:
            try:
                ent_dict, child = recursively_load_entity(child)
                child_list.append(ent_dict)
            except Exception as e:
                print(f"Error reading child {ent.name} with path {UUID_TO_PATH_INDEX[ent.ID]} exception: \n{e}")
                raise e

    # TODO: Change this to check if the bucket has been initialized.
    # data_buckets = []
    # for bucket_path in ent.data_buckets:
    #     bucket = initialize_bucket(bucket_path)
    #     data_buckets.append(bucket.ID)

    process_content_blocks(ent)


    ret_dict = {"id": ent.ID,
                "name": ent.name,
                "type": ent.__class__.__name__,
                "children": child_list,
                }

    return ret_dict, ent


def health_check():
    """
    Function that checks if the server is running
    """
    return make_response("Server is running", 201)


def load_all_entities():
    """
    Function that reads all the entities and return a dictionary with nested entities
    :return:
    """

    for bucket_path in DRAGONLAIR.buckets.values():
        bucket = initialize_bucket(bucket_path)

    for dragon_library in DRAGONLAIR.libraries:
        ret_dict, library = recursively_load_entity(dragon_library.path)
        DRAGONLAIR.insert_library_instance(library)

    # We replace the parent and children after we are done going through all identities to make sure that
    # the parent is already in the index, there might be edge cases where a lower entity in the tree has a parent
    # somewhere else (probably more important once we start allowing branching)

    # Update the parent of the children
    for key, val in INDEX.items():
        path = Path(val.parent)
        if path.is_file():
            val.parent = PATH_TO_UUID_INDEX[str(path)]

        # Update the children of the parent
        for child in val.children:
            path = Path(child)
            if path.is_file():
                val.children[val.children.index(child)] = PATH_TO_UUID_INDEX[str(path)]

        # Update the order:
        order_copy = val.order.copy()
        for i, (item, item_type, show) in enumerate(order_copy):
            if item_type == "entity":
                path = Path(item)
                if path.is_file():
                    val.order[i] = (PATH_TO_UUID_INDEX[str(path)], item_type, show)

        for buck in val.data_buckets:
            path = Path(buck)
            if path.is_file():
                val.data_buckets[val.data_buckets.index(buck)] = PATH_TO_UUID_INDEX[str(path)]


def _generate_structure_helper(ent):

    children = [_generate_structure_helper(INDEX[child]) for child in ent.children if INDEX[child].deleted is False]
    name = ent.name
    ID = ent.ID
    type_ = ent.__class__.__name__
    return {"name": name, "id": ID, "children": children, "type": type_}


def generate_structure(ID=None):

    ret = []
    if ID is None:
        for lib in DRAGONLAIR.libraries:
            ret.append(_generate_structure_helper(INDEX[lib.ID]))
    else:
        if ID not in INDEX:
            abort(404, f"Entity with ID {ID} not found")
        ret = _generate_structure_helper(INDEX[ID])

    return make_response(json.dumps(ret), 200)


# FIXME: This is a bad name, it should probably be read entity or something like that instead.
def read_one(ID, name_only=False):
    """
    API function that returns an entity based on its ID
    """

    if ID == DRAGONLAIR.ID:
        abort(405, "That ID belongs to the lair, you should not be accessing it directly.")

    if ID == "null":
        abort(404, "ID is null")

    if ID not in INDEX:
        load_all_entities()

    if ID in INDEX:
        ent = INDEX[ID]

        if name_only:
            return ent.name, 200

        ent_copy = copy.deepcopy(ent)
        for block in ent_copy.content_blocks:
            if block.block_type == SupportedContentBlockType.text.value:
                replaced_path = content_block_path_to_uuid(block.content[-1])
                block.content[-1] = replaced_path

        # If it is an instance, convert the notebooks into html
        if isinstance(ent, Instance):
            converted_analysis = []
            for analysis_nb in ent_copy.analysis:
                    # Read the notebook
                    nb = nbformat.read(analysis_nb, as_version=4)

                    # Create HTML exporter
                    html_exporter = HTMLExporter()
                    html_exporter.theme = "dark"  # Change the theme of the notebook
                    html_exporter.template_name = 'classic'  # use classic template (you can change this)

                    # Export the notebook to HTML format
                    (body, resources) = html_exporter.from_notebook_node(nb)
                    converted_analysis.append((Path(analysis_nb).stem, str(body)))

            # TOML table does not like having a string that is as long as an html file so the conversion needs to happen
            # after the TOML conversion.
            serialized = dict(ent_copy.to_TOML()[ent_copy.name])
            serialized['analysis'] = converted_analysis

            return json.dumps(serialized), 201

        return json.dumps(ent_copy.to_TOML()[ent_copy.name]), 201
    else:
        abort(404, f"Entity with ID {ID} not found")


def read_content_block(ID, blockID, whole_content_block=False):
    """
    API function that looks at the block ID of the entity with ID and returns the content block

    :param ID:
    :param blockID:
    :param whole_content_block: if True, returns the whole content block, if False, returns only the last content.
    :return:
    """

    if ID not in INDEX:
        abort(404, f"Entity with ID {ID} not found")

    ent = INDEX[ID]
    ids = [c.ID for c in ent.content_blocks]
    if blockID not in ids:
        abort(404, f"Content block with ID {blockID} not found")
    ind = ids.index(blockID)
    if ind == -1:
        abort(404, f"Content block with ID {blockID} not found")
    block = ent.content_blocks[ind]
    content, author, date = block.latest_version()

    if block.block_type == SupportedContentBlockType.image:
        return send_file(content[0])

    if whole_content_block:
        return json.dumps(str(block)), 201
    else:
        return json.dumps(content), 201


def generate_tree(ID: str, deepness: int = 7):
    """
    Deepness is the number of levels of children that are included in the tree.
    as well as how many children per level are returning.

    :param ent: The entity to generate the tree from
    :param deepness: How many items and levels (rank) to include in the tree.
    """
    new_node = "├── "
    last_node = "└── "
    empty_node = "    "
    vertical_node = "│   "
    incomplete_node = "└ ⋯ "

    def populate_tree(ent, deepness, parent_tree, level=0):
        if level == deepness:
            return parent_tree

        parent_tree[ent.name] = {}
        for i, child in enumerate(ent.children):
            if i == deepness:
                break
            populate_tree(INDEX[child], deepness, parent_tree[ent.name], level+1)

        if len(parent_tree[ent.name]) == len(ent.children):
            parent_tree[ent.name]["__complete__"] = True
        else:
            parent_tree[ent.name]["__complete__"] = False
        return parent_tree

    def make_tree(data, ret_="", fill_indent=0, empty_indent=0):
        n_keys = len(list(data.keys()))
        lines = ret_.split("\n")

        # you need to change from fill indent to empty indent in the last row
        # so that lines that head to nowhere don't appear
        if len(lines) >= 2 and last_node in lines[-2]:
            empty_indent += 1
            fill_indent -= 1

        if fill_indent + empty_indent == 0:
            keys = list(data.keys())
            ret_ += keys[0] + "\n"
            ret_ = make_tree(data[keys[0]], ret_, fill_indent, empty_indent + 1)
        else:
            for i, (key, value) in enumerate(data.items()):
                if key == "__complete__":
                    if value:
                        continue
                    else:
                        new_addition = empty_node * empty_indent + fill_indent * vertical_node + incomplete_node + "\n"
                        ret_ += new_addition
                    continue

                # Deciding what node to use, if last or new one
                # You need -2 because the complete key is metadata
                selected_node = new_node
                if i == n_keys - 2 and data["__complete__"] is True:
                    selected_node = last_node

                new_addition = empty_node * empty_indent + fill_indent * vertical_node + selected_node + key + "\n"
                ret_ += new_addition
                ret_ = make_tree(value, ret_, fill_indent + 1, empty_indent)
        return ret_

    ent = INDEX[ID]

    tree = {}
    tree = populate_tree(ent, deepness, tree)
    ret = make_tree(tree)
    return make_response(json.dumps(ret), 201)


def _get_rank_and_num_children(ent: Entity) -> Tuple[int, int]:
    """
    Recursive helper function. Returns the rank of the entity and the total number of children it has.

    :param ent: The current entity that we are going over.
    :return: The number of entities that are child of ent as well as the rank of this entity.
    """
    rank = 0
    num_children = 0
    for child_id in ent.children:
        if child_id in INDEX:
            num_children += 1
            child = INDEX[child_id]
            child_rank, child_num_children = _get_rank_and_num_children(child)
            rank = max(rank, child_rank + 1)
            num_children += child_num_children

    return rank, num_children


def read_entity_info(ID):
    """
    For now, this function only figures out the "rank" and the total number of children it has.
    By "rank" we mean how many levels deep the children go, multiple siblings do not add to this number.

    :param ID:
    :return:
    """

    if ID not in INDEX:
        abort(404, f"Entity with ID {ID} not found")

    ent = INDEX[ID]
    rank, num_children = _get_rank_and_num_children(ent)
    return make_response(json.dumps({"rank": rank, "num_children": num_children}), 201)


def add_text_block(ID, body, user: str, under_child: str = None):
    """
    Adds a text block to the indicated entity. It does not handle images or tables yet.

    :param ID: The id of the entity the block should be added to.
    :param body: The text.
    :param user: Optional argument. If passed, the author of the content_block will be that username instead of the
     user of the entity.
    """

    if ID not in INDEX:
        abort(404, f"Entity with ID {ID} not found")

    under_child = under_child if (under_child is not None and under_child != "undefined") else None

    user = _parse_and_validate_user(user)

    ent = INDEX[ID]

    ent.add_text_block(body, user, under_child)

    # After adding the content blocks update the file location
    ent_path = Path(UUID_TO_PATH_INDEX[ID])
    copy_ent = create_path_entity_copy(ent)
    copy_ent.to_TOML(ent_path)

    return make_response("Content block added", 201)


def edit_text_block(ID, blockID, body, user):

    if ID not in INDEX:
        abort(404, f"Entity with ID {ID} not found")

    user = _parse_and_validate_user(user)

    ent = INDEX[ID]

    try:
        ret = ent.modify_text_block(blockID, body, user)
        if ret:
            # Convert uuids in the entity to paths
            path_copy = create_path_entity_copy(ent)
            path_copy.to_TOML(Path(UUID_TO_PATH_INDEX[ID]))
            return make_response("Content block edited successfully", 201)
    except ValueError as e:
        abort(400, str(e))

    return abort(400, "Something went wrong, try again")


def _add_image(image, filename=None):
    converted_image = Image.open(image.stream)
    if filename is None:
        filename = secure_filename(image.filename)
    file_path = RESOURCEPATH.joinpath(filename).resolve()

    while file_path.is_file():
        f_parts = filename.split('.')
        if len(f_parts) != 2:
            abort(400, "The filename is not in the correct format")
        new_name = f_parts[0] + '_' + ''.join(random.choice(string.ascii_letters) for i in range(6)) + '.' + f_parts[1]
        file_path = RESOURCEPATH.joinpath(new_name).resolve()

    converted_image.save(file_path)
    return file_path, filename


def add_image_block(ID, user, body, image, under_child=None):

    if ID not in INDEX:
        abort(404, f"Entity with ID {ID} not found")

    user = _parse_and_validate_user(user)

    ent = INDEX[ID]

    under_child = under_child if (under_child is not None and under_child != "undefined") else None

    file_path, filename = _add_image(image)

    ent.add_image_block(file_path, filename, user, under_child)

    # After adding the content blocks update the file location
    ent_path = Path(UUID_TO_PATH_INDEX[ID])
    copy_ent = create_path_entity_copy(ent)
    copy_ent.to_TOML(ent_path)

    return make_response("Content block added", 201)


def edit_image_block(ID, blockID, user, body, image=None, title=None):
    if ID not in INDEX:
        abort(404, f"Entity with ID {ID} not found")

    user = _parse_and_validate_user(user)

    ent = INDEX[ID]

    # for some reason connexion only passes image as an argument if there is an actual image there, if its None/null
    # e.i. changing the title only, it is in body.
    image = body["image"] if "image" in body else image

    if image == "null":
        image = None

    if title == "null":
        title = None

    file_path, filename = None, None
    if image is not None:
        file_path, filename = _add_image(image)

    try:
        ret = ent.modify_image_block(blockID, user, image_path=file_path, title=title)
        if ret:
            # Convert uuids in the entity to paths
            path_copy = create_path_entity_copy(ent)
            path_copy.to_TOML(Path(UUID_TO_PATH_INDEX[ID]))
            return make_response("Content block edited successfully", 201)
    except ValueError as e:
        abort(400, str(e))

    return abort(400, "Something went wrong, try again")


def add_image_link_block(ID, user, instance_id, image_path, under_child=None):
    if ID not in INDEX:
        abort(404, f"Entity with ID {ID} not found")

    if instance_id not in INDEX:
        abort(404, f"Instance with ID {instance_id} not found")

    user = _parse_and_validate_user(user)
    under_child = under_child if (under_child is not None and under_child != "undefined" and ID != under_child) else None

    ent = INDEX[ID]

    image_path = image_path.replace("#", "/")

    ent.add_image_link_block(instance_id, image_path, user, under_child)

    # After adding the content blocks update the file location
    ent_path = Path(UUID_TO_PATH_INDEX[ID])
    copy_ent = create_path_entity_copy(ent)
    copy_ent.to_TOML(ent_path)

    return make_response("Content block added", 201)


def delete_content_block(ID, blockID):

    if ID not in INDEX:
        abort(404, f"Entity with ID {ID} not found")

    ent = INDEX[ID]

    try:
        ret = ent.delete_block(blockID)
        if ret:
            path_copy = create_path_entity_copy(ent)
            path_copy.to_TOML(Path(UUID_TO_PATH_INDEX[ID]))
            return make_response("Content block deleted successfully", 200)
    except ValueError as e:
        abort(400, str(e))

    return abort(400, "Something went wrong, try again")


def add_library(body):
    """
    Creates a new library and adds it to the system.

    :param body: dictionary with the keys:
        * name: Name of the library
        * user: User that created the library
    """
    if "name" not in body or body['name'] == "":
        abort(400, "Name of library is required")
    if "user" not in body or body['user'] == "":
        abort(400, "User of library is required")

    user = _parse_and_validate_user(body['user'])

    library = Library(name=body['name'], user=user)
    lib_path = LAIRSPATH.joinpath(library.ID[:8] + '_' + library.name + '.toml')

    path_copy = create_path_entity_copy(library)
    path_copy.to_TOML(lib_path)

    DRAGONLAIR.add_library(library, lib_path)
    add_ent_to_index(library, lib_path)

    return make_response(f"Library named {body['name']} added", 201)


# TODO: Check for buckets as well, these should be added from here
def add_entity(body):
    """
    Creates an entity through the API call. It will add the entity to the parent and create the new TOML file
     immediately.

    :param body: dictionary with the keys:
        * name: Name of the entity
        * type: Type of the entity
        * parent: ID of the parent entity
        * user: User that created the entity
        * under_child: Optional argument. If passed, the entity will be added under the child with the given ID.
            Content blocks count as children.
    """
    if "name" not in body or body['name'] == "":
        abort(400, "Name of entity is required")
    if "type" not in body or body['type'] == "":
        abort(400, "Type of entity is required")
    if "parent" not in body or body['parent'] == "":
        abort(400, "Parent of entity is required")
    if "user" not in body or body['user'] == "":
        abort(400, "User of entity is required")

    under_child = body["under_child"] if "under_child" in body else None

    user = _parse_and_validate_user(body['user'])

    if body["parent"] not in INDEX:
        abort(404, f"Parent entity with ID {body['parent']} not found")

    if body["type"] == "Library":
        abort(401, "You cannot add a library through this endpoint")

    if body["type"] not in ALLOWED_PARENTAL_RELATIONS.keys():
        abort(400, f"Type of entity {body['type']} is not allowed")

    parent = INDEX[body["parent"]]
    if body["type"] not in ALLOWED_PARENTAL_RELATIONS[parent.__class__.__name__]:
        abort(403, f"The parent of type: {parent.__class__.__name__} cannot have children of type: {body['type']}")

    cls = ALL_TYPES[body["type"]]
    ent = cls(name=body["name"], parent=body["parent"], user=user)
    parent_path = Path(UUID_TO_PATH_INDEX[parent.ID])
    ent_path = parent_path.parent.joinpath(ent.ID[:8] + "_" + ent.name + ".toml")

    add_ent_to_index(ent, ent_path)

    # Create copy of the entity with paths to create the TOML file.
    ent_copy = create_path_entity_copy(ent)

    parent.add_child(ent.ID, under_child=under_child)
    parent_copy = create_path_entity_copy(parent)

    parent_copy.to_TOML(parent_path)
    ent_copy.to_TOML(ent_path)

    return make_response("Entity added", 201)


def delete_entity(ID):

    if ID not in INDEX:
        abort(404, f"Entity with ID {ID} not found")

    ent = INDEX[ID]
    if ent.parent not in INDEX:
        abort(404, f"Parent entity with ID {ent.parent} not found")

    parent = INDEX[ent.parent]
    parent.delete_child(ID)
    parent_copy = create_path_entity_copy(parent)
    parent_copy.to_TOML(Path(UUID_TO_PATH_INDEX[parent.ID]))

    # Flag the entity as deleted
    ent.deleted = True
    ent_copy = create_path_entity_copy(ent)
    ent_copy.to_TOML(Path(UUID_TO_PATH_INDEX[ID]))

    return make_response("Entity deleted", 201)


# TODO: Better record keeping of when the name is change and who changed it is needed.
def change_entity_name(ID, body):
    """
    Changes the name of an entity and updates the TOML file.

    :param ID: id of the entity
    :param body[new_name]: new name of the entity
    """

    if ID not in INDEX:
        abort(404, f"Entity with ID {ID} not found")
    if "new_name" not in body or body['new_name'] == "":
        abort(400, "New name of entity is required")

    new_name = body['new_name']

    ent = INDEX[ID]
    ent.change_name(new_name)
    old_ent_path = Path(UUID_TO_PATH_INDEX[ID])
    new_ent_path = old_ent_path.parent.joinpath(f"{ID[:8]}_" + new_name + '.toml')

    # Update the UUID indexes
    del PATH_TO_UUID_INDEX[str(old_ent_path)]
    PATH_TO_UUID_INDEX[str(new_ent_path)] = ID
    UUID_TO_PATH_INDEX[ID] = str(new_ent_path)

    # Update the TOML file
    ent_copy = create_path_entity_copy(ent)
    ent_copy.to_TOML(Path(UUID_TO_PATH_INDEX[ID]))

    # Update parents
    parent = INDEX[ent.parent]
    parent_copy = create_path_entity_copy(parent)
    parent_copy.to_TOML(Path(UUID_TO_PATH_INDEX[parent.ID]))

    # Update the children
    for child in ent.children:
        child_ent = INDEX[child]
        child_ent_copy = create_path_entity_copy(child_ent)
        child_ent_copy.to_TOML(Path(UUID_TO_PATH_INDEX[child]))

    if new_ent_path.is_file():
        old_ent_path.unlink()
    else:
        abort(400, f"Could not find the file {old_ent_path}")

    return make_response("Entity name changed", 201)


def _check_for_notebook_parent(ent):

    parent = INDEX[ent.parent]

    if parent.parent == "" or parent.parent is None:
        return abort(404, f"Entity with ID {ent.ID} is not in a notebook")

    if isinstance(parent, Notebook):
        return parent.ID

    return _check_for_notebook_parent(parent)


def get_notebook_parent(ID):
    """
    Checks the ID given of an entity and returns the ID of the notebook it is contained in.
    """

    if ID not in INDEX:
        abort(404, f"Entity with ID {ID} not found")

    ent = INDEX[ID]
    if isinstance(ent, Notebook):
        return make_response(ent.ID, 201)

    if isinstance(ent, Library):
        return abort(404, f"Entity with ID {ID} is a library and does not have a notebook")

    return str(_check_for_notebook_parent(ent)), 201


def get_all_libraries():

    libraries = {}
    for lib in DRAGONLAIR.libraries:
        libraries[lib.name] = lib.ID

    return make_response(json.dumps(libraries), 201)


def add_user(email, name):
    """
    Adds a user to the system
    """
    try:
        DRAGONLAIR.add_user(email, name)
        return make_response("User added", 201)
    except ValueError as e:
        abort(400, str(e))


def get_users():
    """
    API function that returns the list of users
    :return: json representation of a list of all the users in the system.
    """
    return json.dumps([u.__dict__ for u in DRAGONLAIR.users.values()]), 201


def set_user_color(email, color, *args, **kwargs):
    try:
        DRAGONLAIR.set_user_color(email, color)
        return make_response("User color set", 201)
    except ValueError as e:
        abort(404, str(e))


def get_types():
    return json.dumps(list(ENTITY_TYPES)), 201


def get_possible_parents():
    """
    API function that returns a dictionary of all the entities
    that can have children with the keys being the ID of the entity and the value its name.
    This is used for the select item to display all the possible parents for new entities.
    :return: json representation of a list of all the possible parents for a given entity
    """
    ret = {}
    for k, v in INDEX.items():
        if v.__class__.__name__ in PARENT_TYPES:
            ret[k] = v.name
    return json.dumps(ret), 201


def _search_parents_with_buckets(ent):
    """
    Recursive function that searches for parent entities with data buckets

    :param ent: The entity to search
    :return: The entity with data buckets, or None if no entity with data buckets can be found
    """
    if ent.parent == "":
        return None

    ret_ent = INDEX[ent.parent]
    if len(ret_ent.data_buckets) == 0:
        ret_ent = _search_parents_with_buckets(ret_ent)

    return ret_ent


def add_bucket(user, name, location=None):
    """
    API function that adds a bucket to the system

    :param user: The user that created the bucket
    :param location: The path to the bucket
    :param name: The name of the bucket
    """

    user = _parse_and_validate_user(user)

    if name in DRAGONLAIR.buckets.keys():
        abort(402, "Bucket with that name already exists")

    bucket = Bucket(name=name, user=user)

    if location is None:
        bucket_path = LAIRSPATH.joinpath(bucket.ID[:8] + '_' + bucket.name + '.toml')
    else:
        location = Path(location)
        if not Path(location).is_dir():
            abort(401, f"Location {location} not found")
        if not location.exists():
            location.mkdir()

        bucket_path = Path(location).joinpath(bucket.ID[:8] + '_' + bucket.name + '.toml')


    path_copy = create_path_entity_copy(bucket)
    path_copy.to_TOML(bucket_path)
    DRAGONLAIR.add_bucket(name, bucket, bucket_path)

    add_ent_to_index(bucket, bucket_path)

    return make_response(f"Bucket named {name} added", 201)


def delete_bucket(bucketID):...




def set_target_bucket(ID, bucket_ID):

    if bucket_ID not in INDEX:
        abort(404, f"Bucket with ID {bucket_ID} not found")

    if ID not in INDEX:
        abort(404, f"Entity with ID {ID} not found")

    bucket = INDEX[bucket_ID]

    if not isinstance(bucket, Bucket):
        abort(400, f"Entity with ID {bucket_ID} is not a bucket")


    entity = INDEX[ID]
    entity.set_bucket_target(bucket.ID)

    # Update the TOML file
    entity = create_path_entity_copy(entity)
    entity.to_TOML(Path(UUID_TO_PATH_INDEX[entity.ID]))

    return make_response("Target set", 201)


def unset_target_bucket(ID, bucket_ID):
    if ID not in INDEX:
        abort(404, f"Entity with ID {ID} not found")

    if bucket_ID not in INDEX:
        abort(404, f"Bucket with ID {bucket_ID} not found")

    entity = INDEX[ID]
    entity.unset_bucket_target(bucket_ID)

    # Update the TOML file
    entity = create_path_entity_copy(entity)
    entity.to_TOML(Path(UUID_TO_PATH_INDEX[entity.ID]))

    return make_response("Target unset", 201)


# FIXME: The return value should have the keys and value of the dictionary flipped.
def get_data_suggestions(ID, query_filter="", num_matches=10):
    """
    Returns matched datasets in a bucket with the query.
    If the entity does not have a bucket, it will search the parents for buckets or return None if no buckets are found.

    :param ID: The id of the entity to search
    :param query: The query to match
    :param num_matches: How many matches until the function stops looking for matches.

    :return: Dictionary with the name of data as keys and the id as values
    """
    matches = {}
    ent = INDEX[ID]
    if len(ent.data_buckets) == 0:
        ent = _search_parents_with_buckets(ent)
        if ent is None:
            return json.dumps({}), 201

    for bucket_path in ent.data_buckets:
        bucket_id = PATH_TO_UUID_INDEX[str(bucket_path)]
        bucket = INDEX[bucket_id]
        pattern = re.compile(query_filter)
        for p, uuid in bucket.path_to_uuid.items():
            if len(matches) >= num_matches:
                break
            path = Path(p)
            instance = INDEX[uuid]
            if 'star' in instance.tags:
                if query_filter == "" or query_filter is None:
                    matches[path.stem] = uuid
                else:
                    if pattern.search(path.stem):
                        matches[path.stem] = uuid

    return json.dumps(matches), 201


def get_graphic_suggestions(ID, query_filter="", num_matches=10):
    """
    Look for images inside of a data bucket. This includes html files containg hvplots.

    :param ID: The ID of the instance you are searching
    :param query_filter: A query to find matches to
    :param num_matches: How many matches until the function stops looking for matches.

    :return: Dictionary with the name of data + images as keys and a 2 object tuple where the first item is the paths to
        the images and second the uuid of the instance they are a part of as values.
    """
    matches = {}
    ent = INDEX[ID]
    if len(ent.data_buckets) == 0:
        ent = _search_parents_with_buckets(ent)
        if ent is None:
            return json.dumps({}), 201

    for bucket_id in ent.data_buckets:
        bucket = INDEX[bucket_id]
        pattern = re.compile(query_filter)
        for p, uuid in bucket.path_to_uuid.items():
            if len(matches) >= num_matches:
                break
            instance = INDEX[uuid]
            for im_p in instance.images:
                p_obj = Path(im_p)
                image_name = p_obj.parts[-3] + "/" + p_obj.parts[-2] + "/" + p_obj.parts[-1] # the parent of the folder name + The folder name + the image
                if (p_obj.suffix == '.html' or p_obj.suffix == '.jpg' or p_obj.suffix == '.png') and pattern.search(image_name):
                    matches[image_name] = (im_p.replace('/', '%23'), instance.ID)

    return json.dumps(matches), 201


def add_instance(body):
    """
    API function that adds an instance to a bucket

    body should be a dictionary with the following keys
        * bucket_ID: The ID of the bucket to add the instance to
        * data_loc: The path of the data that the instance is based on
        * user: The user that created the instance
        * start_time: The start time of the instance
        * end_time: The end time of the instance
    """

    if "bucket_ID" not in body or body['bucket_ID'] == "":
        abort(404, f"Bucket ID is required")
    bucket_ID = body['bucket_ID']
    if "data_loc" not in body or body['data_loc'] == "":
        abort(404, f"Data loc is required")
    data_path = body['data_loc']
    if "user" not in body or body['user'] == "":
        abort(404, f"User is required")
    user = _parse_and_validate_user(body['user'])

    start_time = body.get('start_time', None)
    end_time = body.get('end_time', None)

    if bucket_ID not in INDEX:
        abort(404, f"Entity with ID {bucket_ID} not found")

    bucket = INDEX[bucket_ID]

    if not isinstance(bucket, Bucket):
        abort(400, f"Entity with ID {bucket_ID} is not a bucket")

    # Path to the folder containing the data file
    data_path = Path(data_path)
    if not Path(data_path).is_dir():
        abort(403, f"Data with path {data_path} not found")

    data_file = data_path.joinpath('data.ddh5')
    if not data_file.is_file():
        abort(403, f"Data with path {data_file} not found")

    instance = Instance(name=data_path.name,
                        data=[str(data_file)],
                        user=user,
                        start_time=start_time,
                        end_time=end_time,
                        parent=bucket_ID)

    instance_path = data_path.joinpath(instance.ID[:8] + '_' + data_path.name + '.toml')
    bucket.add_instance(instance_path, instance.ID)

    bucket_copy = create_path_entity_copy(bucket)
    bucket_copy.to_TOML(Path(UUID_TO_PATH_INDEX[bucket_ID]))

    instance_copy = create_path_entity_copy(instance)
    instance_copy.to_TOML(instance_path)

    add_ent_to_index(instance, instance_path)

    return make_response("Instance added", 201)


def add_analysis_files_to_instance(body):
    """
    Adds a list of analysis files to the specified instance. The body should be a dictionary with the following keys:
        * data_loc: The path to the instance. We use path instead of ID because the measurement setups should not know what the ids are.
        * analysis_files: A list of paths to the analysis files to add to the instance. The function will check if the files exists and sort them correctly.
    """

    if "data_loc" not in body or body['data_loc'] == "":
        abort(404, f"Data loc is required")
    data_path = Path(body['data_loc'])
    if str(data_path) not in PATH_TO_UUID_INDEX:
        abort(404, f"Data with path {data_path} not found")
    uuid_ = PATH_TO_UUID_INDEX[str(data_path)]
    if uuid_ not in INDEX:
        abort(404, f"Instance with path {data_path} not found")
    instance = INDEX[uuid_]

    if "analysis_files" not in body or body['analysis_files'] == "":
        abort(400, f"No analysis files are provided")

    analysis_files = body['analysis_files']
    if not isinstance(analysis_files, list):
        abort(400, f"Analysis files should be a list")

    for analysis_file in analysis_files:
        path = Path(analysis_file)
        if not path.is_file():
            abort(404, f"Analysis file with path {path} not found")

        if path.suffix == '.jpg' or path.suffix == '.png':
            if path not in instance.images and analysis_file not in instance.images:
                img = Image.open(path)
                instance.images.append(str(path))
        elif path.suffix == '.html':
            if path not in instance.analysis and analysis_file not in instance.analysis:
                instance.images.append(str(path))
        elif path.suffix == '.ipynb':
            if path not in instance.analysis and analysis_file not in instance.analysis:
                instance.analysis.append(str(path))
        elif path.suffix == '.json':
            if path not in instance.stored_params and analysis_file not in instance.stored_params:
                instance.stored_params.append(str(path))

    instance_copy = create_path_entity_copy(instance)
    instance_copy.to_TOML(data_path)

    return make_response("Analysis files added", 201)


def get_instance_image(imagePath):

    path = Path(imagePath.replace('#', '/'))
    if not path.is_file() or not path.exists():
        abort(404, f"Image with path {path} not found")

    return send_file(path)


def toggle_star(data_loc: str):
    """
    Toggles the star tag of an instance.This changes both the parameter in the folder containing the instance as well as the TOML file.

    :param data_loc: A path containing the instance. This can be either the path to the TOML file, the data file or the folder containing the data file.
    """

    data_path = Path(data_loc)
    if data_path.name == 'data.ddh5':
        instance_path = data_path.parent.joinpath(data_path.parent.name + '.toml')
    elif data_path.is_dir():
        instance_path = data_path.joinpath(data_path.name + '.toml')
    elif data_path.suffix == '.toml':
        instance_path = data_path
    else:
        abort(404, f"Data with path {data_path} not found")

    if not instance_path.is_file():
        abort(404, f"Instance with path {instance_path} not found")

    # FIXME: there definitely is a more efficient way to do this.
    if str(instance_path) not in PATH_TO_UUID_INDEX or PATH_TO_UUID_INDEX[str(instance_path)] not in INDEX:
        abort(404, f"Instance with path {instance_path} not found")

    instance = INDEX[PATH_TO_UUID_INDEX[str(instance_path)]]
    star_path = instance_path.parent.joinpath('__star__.tag')

    if star_path.is_file():
        star_path.unlink()
        if "star" in instance.tags:
            instance.tags.remove("star")
            instance_copy = create_path_entity_copy(instance)
            instance_copy.to_TOML(instance_path)
    else:
        star_path.touch()
        if "star" not in instance.tags:
            instance.tags.append("star")
            instance_copy = create_path_entity_copy(instance)
            instance_copy.to_TOML(instance_path)

    return make_response("Star toggled", 201)


# TODO: This should work through the dragon_lair instead of iterating over the entire index
def get_buckets():
    """
    API function that returns a dictionary of all the buckets
    :return: json with keys being the ID of the bucket and the value its name.
    """
    ret = {}
    for k, v in INDEX.items():
        if isinstance(v, Bucket):
            ret[k] = v.name
    return ret, 201


def get_stored_params(ID):
    """
    Assuming all of the stored parameters are stored in JSON file for now but more complex types can be added.
    """

    def convert_inf_to_string(data):
        """
        fit parameters in json sometimes store inf as a float, this function converts them to string
        """
        if isinstance(data, dict):
            for key, value in data.items():
                if isinstance(value, float):
                    if value == float('inf'):
                        data[key] = "Infinity"
                    elif value == float('-inf'):
                        data[key] = "-Infinity"
                else:
                    convert_inf_to_string(value)
        elif isinstance(data, list):
            for index, item in enumerate(data):
                if isinstance(item, float):
                    if item == float('inf'):
                        data[index] = "Infinity"
                    elif item == float('-inf'):
                        data[index] = "-Infinity"
                else:
                    convert_inf_to_string(item)
        return data

    if ID not in INDEX:
        abort(404, f"Entity with ID {ID} not found")

    ent = INDEX[ID]

    if not isinstance(ent, Instance):
        abort(400, f"Entity with ID {ID} is not an instance")

    if ent.stored_params is None:
        return json.dumps({}), 201

    ret = {}
    for json_path in ent.stored_params:
        path = Path(json_path)
        if path.suffix == '.json':
            with path.open() as json_file:
                data = json.load(json_file)
                ret[path.stem] = data

    return json.dumps(convert_inf_to_string(ret)), 201


def get_fake_mentions():
    """
    Api function used to send a fake list of options for testing mentions

    :return:
    """
    global counter

    fake_dict = {
        "Choose Koala": "9f8968d5-f98e-4ecf-ba37-3a1c84f9da7a",
        "Choose Panda": "23f07cfe-8f82-4294-a9a5-03241ad47194",
        "Named The Koala": "cca50dad-add7-4ea5-b452-d59eb3edb16d",
    }

    return json.dumps(fake_dict), 201


def toggle_bookmark(ID):
    """
    API function that toggles the bookmark of an entity

    :param ID: The ID of the entity to toggle the bookmark
    """
    if ID not in INDEX:
        abort(404, f"Entity with ID {ID} not found")

    ent = INDEX[ID]
    ent.toggle_bookmark()

    # Convert uuids in the entity to paths and saves the change
    path_copy = create_path_entity_copy(ent)
    path_copy.to_TOML(Path(UUID_TO_PATH_INDEX[ID]))

    return make_response("Bookmark toggled", 201)


reset()

# Converters need to be defined at the bottom so they access the indices after they have been instantiated
# Instantiates the HTML to Markdon converter object
html_to_markdown = MyMarkdownConverter(uuid_index=UUID_TO_PATH_INDEX)


markdown_to_html = md = markdown.Markdown(extensions=[CustomLinkExtension(uuid_index=UUID_TO_PATH_INDEX,
                                                                          instance_index=INSTANCEIMAGE),
                                                      TableExtension(use_align_attribute=True),
                                                      CustomHeadlessTableExtension()])
