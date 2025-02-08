import json
import uuid
from dataclasses import dataclass

from ..utils import create_timestamp


@dataclass
class Reply:
    ID: str
    user: list[str]
    body: list[str]
    timestamp: list[str]

    def to_dict(self):
        return {"ID": self.ID,
                "user": self.user,
                "body": self.body,
                "timestamp": self.timestamp,
                }

    @classmethod
    def from_dict(cls, data: dict):
        return cls(**data)

    def __str__(self):

        return json.dumps(self.to_dict()).replace("'", '"')


@dataclass
class Comment:
    """
    Comments that can be attached to entities or content blocks.
    We need a target and a parent separate because the target might be a content block inside an entity,
    so we need to know the ID of that entity to find it later on.
    """
    ID: str
    parent: str
    target: str
    creation_user: str
    creation_time: str
    deleted: bool
    resolved: bool
    body: str
    replies: list[Reply]

    def add_reply(self, body, user):
        reply_ID = str(uuid.uuid4())
        time = create_timestamp()
        reply = Reply(ID=reply_ID,
                      user=[user],
                      body=[body],
                      timestamp=[time]
                      )
        self.replies.append(reply)

    def to_dict(self):
        return {"ID": self.ID,
                "parent": self.parent,
                "target": self.target,
                "creation_user": self.creation_user,
                "creation_time": self.creation_time,
                "deleted": self.deleted,
                "resolved": self.resolved,
                "body": self.body,
                "replies": [str(reply) for reply in self.replies],
        }

    @classmethod
    def from_dict(cls, data: dict) -> 'Comment':
        data['replies'] = [Reply.from_dict(json.loads(reply)) for reply in data['replies']]
        return cls(**data)

    def __str__(self):
        return json.dumps(self.to_dict(), ensure_ascii=False)


def create_comment(body: str, parent: str, target: str, user: str) -> Comment:
    """
    Factory function to create a new comment.
    """
    ID = str(uuid.uuid4())
    time = create_timestamp()
    return Comment(ID=ID,
                   parent=parent,
                   target=target,
                   creation_user=user,
                   creation_time=time,
                   deleted=False,
                   resolved=False,
                   body=body,
                   replies=[])






