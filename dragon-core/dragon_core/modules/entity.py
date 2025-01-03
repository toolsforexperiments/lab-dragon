import uuid
import tomlkit

from pathlib import Path
from typing import List, Tuple, Dict, Optional, Union

from dragon_core.utils import create_timestamp
from dragon_core.components import ContentBlock, SupportedContentBlockType, Table, create_text_block


class Entity(object):

    # If True, checks everytime the entity is saved to_TOML if the filename starts with the first 8 digits of the ID. If it doesn't it adds them.
    START_FILENAME_WITH_ID = True
    
    def __init__(self,
                 user: str,
                 ID: Optional[str] = None,
                 name: str = '',
                 previous_names: List[str] = [],
                 parent: Union[str, Path] = '',
                 deleted: bool = False,
                 description: str = '',
                 content_blocks: List[ContentBlock] = [],
                 children: List[Union[str, Path]] = [],
                 params: List[Tuple[str]] = [],
                 data_buckets: List[Union[str, Path]] = [],
                 bookmarked: bool = False,
                 start_time: str = None,
                 end_time: str = None,
                 order: list[tuple[str, str]] = (),
                 ):
        self.user = user
        if ID is None or ID == '':
            self.ID = str(uuid.uuid4())
        else:
            self.ID = ID

        if name is None or name == '':
            self.name = self.ID
        else:
            self.name = name

        if previous_names is None or previous_names == '':
            self.previous_names = self.ID
        else:
            self.previous_names = previous_names

        self.parent = parent
        self.deleted = deleted
        self.description = description

        if isinstance(order, list) and len(order) != 0:
            self.order = order
        else:
            self.order = [].copy()

        if isinstance(content_blocks, list) and len(content_blocks) != 0:
            self.content_blocks = content_blocks
        else:
            self.content_blocks = [].copy()

        # If we don't save a copy of the list,
        #   python ends up assigning the same object in memory to every Entity instance.
        if isinstance(children, list) and len(children) != 0:
            self.children = children
        else:
            self.children = [].copy()
        # If we don't save a copy of the list,
        #   python ends up assigning the same object in memory to every Entity instance.
        if isinstance(params, list) and len(params) != 0:
            self.params = params
        else:
            self.params = [].copy()
        # If we don't save a copy of the list,
        #   python ends up assigning the same object in memory to every Entity instance.
        if isinstance(data_buckets, list) and len(data_buckets) != 0:
            self.data_buckets = data_buckets
        else:
            self.data_buckets = [].copy()
        self.bookmarked = bookmarked
        if start_time is None or start_time == '':
            self.start_time = create_timestamp()
        else:
            self.start_time = start_time

        if end_time is None or end_time == '':
            self.end_time = create_timestamp()
        else:
            self.end_time = end_time

    def to_TOML(self, path: Optional[Union[str,Path]] = None):

        if hasattr(super(), 'to_TOML'):
            doc = super().to_TOML()
            vals = doc[self.name]
        else:
            doc = tomlkit.document()
            vals = tomlkit.table()

        vals['type'] = self.__class__.__name__
        vals['user'] = self.user
        vals['ID'] = self.ID
        
        vals['name'] = self.name
        
        vals['previous_names'] = self.previous_names
        
        vals['parent'] = str(self.parent)
        
        vals['deleted'] = self.deleted
        
        vals['description'] = self.description
        
        # Same as children, we want to save the str version of every content block, not the object.
        vals['content_blocks'] = [str(block) for block in self.content_blocks]
        
        # We want to save the str version of every child, not the object.
        vals['children'] = [str(child) for child in self.children]
        
        vals['params'] = self.params
        
        vals['data_buckets'] = self.data_buckets
        
        vals['bookmarked'] = self.bookmarked
        
        vals['start_time'] = self.start_time
        
        vals['end_time'] = self.end_time

        vals['order'] = [(str(x[0]), str(x[1])) for x in self.order]
        
        
        doc[self.name] = vals

        if path is not None:
            path = Path(path)
            if path.is_dir():
                path = path.joinpath(self.name + '.toml')
            if self.START_FILENAME_WITH_ID and not path.name.startswith(self.ID[:8] + '_'):
                path = path.parent.joinpath(self.ID[:8] + '_' + path.name)
            with open(path, 'w') as f:
                f.write(doc.as_string())

        return doc

    def __str__(self):
        return str(self.to_TOML())

    def __eq__(self, other):
        if isinstance(other, self.__class__):
            return self.__dict__ == other.__dict__
        return False

    def add_child(self, child, _add_to_order=True):
        if not hasattr(self, 'children'):
            self.children = []
        self.children.append(child)

        if _add_to_order:
            self.order.append((child, "entity"))

    def add_text_block(self, content, user=None, _add_to_order=True):
        new_content_block = create_text_block(content, user)
        self.content_blocks.append(new_content_block)
        if _add_to_order:
            self.order.append((new_content_block.ID, "content_block"))

    def add_image_block(self, image):
        pass

    def modify_content_block(self, block_id, content, user):

        block = None
        for blo in self.content_blocks:
            if blo.ID == block_id:
                block = blo
                break
        if block is None:
            raise ValueError(f"Content block with id {block_id} does not exist.")

        block.modify(content=content, user=user)
        return True

    def delete_block(self, block_id):

        block = None
        for blo in self.content_blocks:
            if blo.ID == block_id:
                block = blo
                break
        if block is None:
            raise ValueError(f"Content block with id {block_id} does not exist.")

        block.deleted = True
        return True

    def suggest_data(self, query: str = "", min_threshold=5) -> List[str]:
        """
        Function used to suggest Instances based on a passed query.
        This function will go to any data bucket attached to this or any parent entity,
        ask all the data buckets associated with them and
        return any Instances that are starred and pass a regex match with the query.
        If no query is passed, it will return all starred Instances.

        :param query: The query to find Instances with.
        :param min_threshold: The minimum number of matches an Instance must have for the search to not
            go to parent data buckets.
        """

        def search_parents(parent, inner_matches):
            if parent is None:
                return inner_matches
            for bucket in parent.data_buckets:
                inner_matches.add(bucket.suggest_data(query))
            if len(inner_matches) < min_threshold:
                return search_parents(parent.parent, inner_matches)
            return inner_matches


        matches = set()
        for bucket in self.data_buckets:
            matches.add(bucket.suggest_data(query))

        if len(matches) < min_threshold:
            matches = search_parents(self.parent, matches)

        return matches

    def toggle_bookmark(self):
        """
        Changes the value in the bookmark field to the opposite of what it currently is.
        """
        self.bookmarked = not self.bookmarked

    def change_name(self, new_name: str):
        """
        Changes the name of the entity to the new name passed.
        """
        self.previous_names.append(self.name)
        self.name = new_name
    

    
    