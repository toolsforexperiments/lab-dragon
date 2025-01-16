import json
import uuid
from enum import Enum
from pathlib import Path
from dataclasses import dataclass
from typing import Union, Tuple, List, Any


from ..utils import create_timestamp
from .table import Table



class SupportedContentBlockType(Enum):
    """
    Enum class that holds the supported types of content blocks.
    """
    text = 1
    image = 2
    table = 3
    code = 4
    image_link = 5



@dataclass
class ContentBlock:
    """
    Class that holds all the versions of a _single_ content block. This is used to keep track of the history of a content block.
    To create a new ContentBlock, use the factory function `create_content_block` or the respective type.

    - ID: The unique ID of the content block. This is assigned at creation.
    - creation_user: The user that originally created the content block.
    - creation_time: Timestamp of the creation of the content block.
    - deleted: A boolean indicating if the content block has been deleted.
    - content: A list holding every modified content.
    - dates: A list of timestamps of the content block.
    - authors: A list of users that have modified the content block.
    - block_type: The type of the content block. This is an instance of SupportedContentBlockType.
    """
    ID: str
    creation_user: str
    creation_time: str
    deleted: bool
    content: List[Any]
    dates: List[str]
    authors: List[str]
    block_type: SupportedContentBlockType

    def modify(self, content: Union[str, tuple[Path, str]], user: str) -> None:
        """
        Modify the content_block.
        This will check if the content or user are different
        and append the new comment to the list of comments and update the timestamp.
        Passing the user is required.

        :param content: The actual content.
        :param user: The user that changed the content block.
        """

        if content != self.content[-1] or user != self.authors[-1]:
            self.content.append(content)
            time = create_timestamp()
            self.dates.append(time)
            self.authors.append(user)

    def latest_version(self) -> Tuple[Any, str, str]:
        """
        Function returning the last version of the content block. The return object is a tuple containing in order:
        - The last content.
        - The user that made the last modification.
        - The timestamp of the last modification.

        :return: A tuple containing the last content and the user that made it.
        """
        return self.content[-1], self.authors[-1], self.dates[-1]

    def to_dict(self) -> dict:
        """
        Convert the ContentBlock to a dictionary suitable for JSON serialization.
        """

        serialized_content = self.content
        if self.block_type == SupportedContentBlockType.image:
            serialized_content = [(str(content[0]), content[1]) for content in self.content]

        return {
            'ID': self.ID,
            'creation_user': self.creation_user,
            'creation_time': self.creation_time,
            'deleted': self.deleted,
            'content': serialized_content,
            'dates': self.dates,
            'authors': self.authors,
            'block_type': self.block_type.value
        }

    @classmethod
    def from_dict(cls, data: dict) -> 'ContentBlock':
        """
        Create a ContentBlock instance from a dictionary.
        """
        data['block_type'] = SupportedContentBlockType(data['block_type'])
        if data['block_type'] == SupportedContentBlockType.image:
            data['content'] = [(Path(content[0]), content[1]) for content in data['content']]
        return cls(**data)

    def __str__(self):
        return json.dumps(self.to_dict())


def create_text_block(content: str, user: str) -> ContentBlock:
    """
    Factory function to create a new text block.

    :param content: The content of the text block.
    :param user: The user that created the text block.
    :return: A new ContentBlock instance.
    """
    ID = str(uuid.uuid4())
    time = create_timestamp()
    return ContentBlock(ID=ID,
                        creation_user=user,
                        creation_time=time,
                        deleted=False,
                        content=[content],
                        dates=[time],
                        authors=[user],
                        block_type=SupportedContentBlockType.text)


def create_image_block(image_path: Path, title: str, user: str) -> ContentBlock:
    """
    Factory function to create a new image block. Image blocks have a tuple in their content field,
    containing the image path as the first item and a title as the second item.
    """

    ID = str(uuid.uuid4())
    time = create_timestamp()
    return ContentBlock(ID=ID,
                        creation_user=user,
                        creation_time=time,
                        deleted=False,
                        content=[(image_path, title)],
                        dates=[time],
                        authors=[user],
                        block_type=SupportedContentBlockType.image)


def create_image_link_block(image_path: Path, instance_id: str, user: str) -> ContentBlock:
    ID = str(uuid.uuid4())
    time = create_timestamp()
    return ContentBlock(ID=ID,
                        creation_user=user,
                        creation_time=time,
                        deleted=False,
                        content=[(image_path, instance_id)],
                        dates=[time],
                        authors=[user],
                        block_type=SupportedContentBlockType.image_link)






