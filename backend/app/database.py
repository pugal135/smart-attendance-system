# -*- coding: utf-8 -*-
import asyncio
import json
import os
import re
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from bson import ObjectId
import motor.motor_asyncio
from app.config import settings


def serialize_doc(d: Any) -> Any:
    if d is None:
        return None
    if isinstance(d, ObjectId):
        return str(d)
    if isinstance(d, dict):
        return {k: serialize_doc(v) for k, v in d.items()}
    if isinstance(d, list):
        return [serialize_doc(i) for i in d]
    return d


def normalize_query(q: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    if not q or not isinstance(q, dict):
        return q or {}
    new_q = {}
    for k, v in q.items():
        if k == "_id" and isinstance(v, str):
            if ObjectId.is_valid(v):
                new_q[k] = {"$in": [v, ObjectId(v)]}
            else:
                new_q[k] = v
        elif isinstance(v, dict):
            new_q[k] = normalize_query(v)
        elif isinstance(v, list):
            new_q[k] = [normalize_query(i) if isinstance(i, dict) else i for i in v]
        else:
            new_q[k] = v
    return new_q


class MotorCollectionWrapper:
    def __init__(self, collection):
        self._col = collection
        self.name = collection.name

    async def find_one(self, query: Optional[Dict[str, Any]] = None, *args, **kwargs) -> Optional[Dict[str, Any]]:
        norm_q = normalize_query(query)
        doc = await self._col.find_one(norm_q, *args, **kwargs)
        return serialize_doc(doc)

    async def find(self, query: Optional[Dict[str, Any]] = None, sort: Optional[List] = None, skip: int = 0, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        norm_q = normalize_query(query)
        cursor = self._col.find(norm_q)
        if sort:
            cursor = cursor.sort(sort)
        if skip:
            cursor = cursor.skip(skip)
        if limit:
            cursor = cursor.limit(limit)
        docs = await cursor.to_list(length=None)
        return serialize_doc(docs) or []

    async def insert_one(self, doc: Dict[str, Any]):
        doc_copy = dict(doc)
        if "_id" not in doc_copy:
            doc_copy["_id"] = str(uuid.uuid4())
        if "created_at" not in doc_copy:
            doc_copy["created_at"] = datetime.utcnow().isoformat()
        if "updated_at" not in doc_copy:
            doc_copy["updated_at"] = datetime.utcnow().isoformat()
        res = await self._col.insert_one(doc_copy)
        return type("InsertResult", (), {"inserted_id": str(res.inserted_id)})()

    async def insert_many(self, doc_list: List[Dict[str, Any]]):
        now = datetime.utcnow().isoformat()
        clean_docs = []
        for d in doc_list:
            d_copy = dict(d)
            if "_id" not in d_copy:
                d_copy["_id"] = str(uuid.uuid4())
            if "created_at" not in d_copy:
                d_copy["created_at"] = now
            if "updated_at" not in d_copy:
                d_copy["updated_at"] = now
            clean_docs.append(d_copy)
        res = await self._col.insert_many(clean_docs)
        return type("InsertManyResult", (), {"inserted_ids": [str(i) for i in res.inserted_ids]})()

    async def update_one(self, query: Dict[str, Any], update: Dict[str, Any], upsert: bool = False):
        norm_q = normalize_query(query)
        res = await self._col.update_one(norm_q, update, upsert=upsert)
        return type("UpdateResult", (), {"modified_count": res.modified_count})()

    async def update_many(self, query: Dict[str, Any], update: Dict[str, Any]):
        norm_q = normalize_query(query)
        res = await self._col.update_many(norm_q, update)
        return type("UpdateResult", (), {"modified_count": res.modified_count})()

    async def delete_one(self, query: Dict[str, Any]):
        norm_q = normalize_query(query)
        res = await self._col.delete_one(norm_q)
        return type("DeleteResult", (), {"deleted_count": res.deleted_count})()

    async def delete_many(self, query: Dict[str, Any]):
        norm_q = normalize_query(query)
        res = await self._col.delete_many(norm_q)
        return type("DeleteResult", (), {"deleted_count": res.deleted_count})()

    async def count_documents(self, query: Optional[Dict[str, Any]] = None) -> int:
        norm_q = normalize_query(query)
        return await self._col.count_documents(norm_q)


class JSONDocumentCollection:
    def __init__(self, name: str, db_file_path: str):
        self.name = name
        self.db_file_path = db_file_path
        self._lock = asyncio.Lock()

    def _read_all(self) -> List[Dict[str, Any]]:
        if not os.path.exists(self.db_file_path):
            return []
        try:
            with open(self.db_file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                return data.get(self.name, [])
        except Exception:
            return []

    def _write_all(self, items: List[Dict[str, Any]]):
        os.makedirs(os.path.dirname(self.db_file_path), exist_ok=True)
        data = {}
        if os.path.exists(self.db_file_path):
            try:
                with open(self.db_file_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
            except Exception:
                data = {}
        data[self.name] = items
        with open(self.db_file_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, default=str)

    def _matches_filter(self, doc: Dict[str, Any], query: Dict[str, Any]) -> bool:
        for key, val in query.items():
            if key == "$or":
                if not any(self._matches_filter(doc, sub_q) for sub_q in val):
                    return False
                continue
            if key == "$and":
                if not all(self._matches_filter(doc, sub_q) for sub_q in val):
                    return False
                continue
                
            doc_val = doc.get(key)
            if isinstance(val, dict):
                for op, op_val in val.items():
                    if op == "$eq" and doc_val != op_val:
                        return False
                    elif op == "$ne" and doc_val == op_val:
                        return False
                    elif op == "$in" and (doc_val not in op_val and str(doc_val) not in [str(x) for x in op_val]):
                        return False
                    elif op == "$nin" and doc_val in op_val:
                        return False
                    elif op == "$gt" and (doc_val is None or doc_val <= op_val):
                        return False
                    elif op == "$gte" and (doc_val is None or doc_val < op_val):
                        return False
                    elif op == "$lt" and (doc_val is None or doc_val >= op_val):
                        return False
                    elif op == "$lte" and (doc_val is None or doc_val > op_val):
                        return False
                    elif op == "$regex":
                        pattern = op_val
                        flags = 0
                        if val.get("$options") == "i":
                            flags = re.IGNORECASE
                        if not doc_val or not re.search(pattern, str(doc_val), flags):
                            return False
            else:
                if doc_val != val and str(doc_val) != str(val):
                    return False
        return True

    async def find_one(self, query: Optional[Dict[str, Any]] = None) -> Optional[Dict[str, Any]]:
        query = query or {}
        async with self._lock:
            docs = self._read_all()
            for doc in docs:
                if self._matches_filter(doc, query):
                    return serialize_doc(doc)
            return None

    async def find(self, query: Optional[Dict[str, Any]] = None, sort: Optional[List] = None, skip: int = 0, limit: Optional[int] = None):
        query = query or {}
        async with self._lock:
            docs = self._read_all()
            matched = [doc for doc in docs if self._matches_filter(doc, query)]
            
            if sort:
                for sort_field, direction in reversed(sort):
                    reverse = (direction == -1 or direction == "desc")
                    matched.sort(key=lambda x: (x.get(sort_field) is None, x.get(sort_field, "")), reverse=reverse)
            
            if skip:
                matched = matched[skip:]
            if limit:
                matched = matched[:limit]
            return serialize_doc(matched) or []

    async def insert_one(self, doc: Dict[str, Any]):
        async with self._lock:
            docs = self._read_all()
            if "_id" not in doc:
                doc["_id"] = str(uuid.uuid4())
            if "created_at" not in doc:
                doc["created_at"] = datetime.utcnow().isoformat()
            if "updated_at" not in doc:
                doc["updated_at"] = datetime.utcnow().isoformat()
            docs.append(doc)
            self._write_all(docs)
            return type("InsertResult", (), {"inserted_id": doc["_id"]})()

    async def insert_many(self, doc_list: List[Dict[str, Any]]):
        async with self._lock:
            docs = self._read_all()
            ids = []
            now = datetime.utcnow().isoformat()
            for doc in doc_list:
                if "_id" not in doc:
                    doc["_id"] = str(uuid.uuid4())
                if "created_at" not in doc:
                    doc["created_at"] = now
                if "updated_at" not in doc:
                    doc["updated_at"] = now
                ids.append(doc["_id"])
                docs.append(doc)
            self._write_all(docs)
            return type("InsertManyResult", (), {"inserted_ids": ids})()

    async def update_one(self, query: Dict[str, Any], update: Dict[str, Any], upsert: bool = False):
        async with self._lock:
            docs = self._read_all()
            modified = 0
            for i, doc in enumerate(docs):
                if self._matches_filter(doc, query):
                    if "$set" in update:
                        for k, v in update["$set"].items():
                            doc[k] = v
                    if "$push" in update:
                        for k, v in update["$push"].items():
                            if k not in doc or not isinstance(doc[k], list):
                                doc[k] = []
                            doc[k].append(v)
                    doc["updated_at"] = datetime.utcnow().isoformat()
                    docs[i] = doc
                    modified = 1
                    break
            if not modified and upsert:
                new_doc = {k: v for k, v in query.items() if not k.startswith("$")}
                if "$set" in update:
                    new_doc.update(update["$set"])
                if "_id" not in new_doc:
                    new_doc["_id"] = str(uuid.uuid4())
                if "created_at" not in new_doc:
                    new_doc["created_at"] = datetime.utcnow().isoformat()
                if "updated_at" not in new_doc:
                    new_doc["updated_at"] = datetime.utcnow().isoformat()
                docs.append(new_doc)
                modified = 1
            if modified:
                self._write_all(docs)
            return type("UpdateResult", (), {"modified_count": modified})()

    async def update_many(self, query: Dict[str, Any], update: Dict[str, Any]):
        async with self._lock:
            docs = self._read_all()
            modified = 0
            for i, doc in enumerate(docs):
                if self._matches_filter(doc, query):
                    if "$set" in update:
                        for k, v in update["$set"].items():
                            doc[k] = v
                    doc["updated_at"] = datetime.utcnow().isoformat()
                    docs[i] = doc
                    modified += 1
            if modified:
                self._write_all(docs)
            return type("UpdateResult", (), {"modified_count": modified})()

    async def delete_one(self, query: Dict[str, Any]):
        async with self._lock:
            docs = self._read_all()
            new_docs = []
            deleted = 0
            for doc in docs:
                if deleted == 0 and self._matches_filter(doc, query):
                    deleted = 1
                    continue
                new_docs.append(doc)
            if deleted:
                self._write_all(new_docs)
            return type("DeleteResult", (), {"deleted_count": deleted})()

    async def delete_many(self, query: Dict[str, Any]):
        async with self._lock:
            docs = self._read_all()
            new_docs = [doc for doc in docs if not self._matches_filter(doc, query)]
            deleted = len(docs) - len(new_docs)
            if deleted:
                self._write_all(new_docs)
            return type("DeleteResult", (), {"deleted_count": deleted})()

    async def count_documents(self, query: Optional[Dict[str, Any]] = None) -> int:
        query = query or {}
        async with self._lock:
            docs = self._read_all()
            return sum(1 for doc in docs if self._matches_filter(doc, query))


class DatabaseManager:
    def __init__(self):
        self.client = None
        self.db = None
        self.is_motor = False
        self.storage_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "app_database.json")
        self._wrapped_collections = {}

    async def connect(self):
        try:
            client = motor.motor_asyncio.AsyncIOMotorClient(
                settings.MONGODB_URL,
                serverSelectionTimeoutMS=2000
            )
            await client.admin.command('ping')
            self.client = client
            self.db = self.client[settings.DATABASE_NAME]
            self.is_motor = True
            print(f"[DB] Successfully connected to live MongoDB at {settings.MONGODB_URL}")
        except Exception as e:
            print(f"[DB] Live MongoDB server not reachable ({e}). Initializing high-performance persistent async JSON document engine at {self.storage_path}")
            self.is_motor = False

    def get_collection(self, name: str):
        if name in self._wrapped_collections:
            return self._wrapped_collections[name]
        if self.is_motor and self.db is not None:
            wrapped = MotorCollectionWrapper(self.db[name])
            self._wrapped_collections[name] = wrapped
            return wrapped
        json_col = JSONDocumentCollection(name, self.storage_path)
        self._wrapped_collections[name] = json_col
        return json_col


db_manager = DatabaseManager()


def get_collection(name: str):
    return db_manager.get_collection(name)
