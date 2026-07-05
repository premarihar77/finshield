from datetime import datetime, timezone
from typing import Any

from bson import ObjectId


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def serialize_doc(document: dict[str, Any] | None) -> dict[str, Any] | None:
    if not document:
        return None
    output = dict(document)
    if "_id" in output:
        output["id"] = str(output.pop("_id"))
    for key, value in list(output.items()):
        if isinstance(value, ObjectId):
            output[key] = str(value)
        elif isinstance(value, datetime):
            output[key] = value.isoformat()
    return output


def serialize_docs(documents: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [serialize_doc(document) for document in documents]
