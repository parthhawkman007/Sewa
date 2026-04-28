import json
import os
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from google.cloud import firestore
import firebase_admin
from firebase_admin import credentials, firestore as admin_firestore
from app.core.config import get_settings

class BaseRepository(ABC):
    @abstractmethod
    async def get_all(self, collection: str) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    async def get_by_id(self, collection: str, item_id: str) -> Optional[Dict[str, Any]]:
        pass

    @abstractmethod
    async def create(self, collection: str, data: Dict[str, Any]) -> Dict[str, Any]:
        pass

    @abstractmethod
    async def update(self, collection: str, item_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        pass

class JSONRepository(BaseRepository):
    def __init__(self, file_path: str = "db.json"):
        self.file_path = file_path
        if not os.path.exists(self.file_path):
            with open(self.file_path, "w") as f:
                json.dump({}, f)
    
    def _read_db(self) -> Dict[str, Any]:
        with open(self.file_path, "r") as f:
            return json.load(f)

    def _write_db(self, db: Dict[str, Any]):
        with open(self.file_path, "w") as f:
            json.dump(db, f, indent=2)

    async def get_all(self, collection: str) -> List[Dict[str, Any]]:
        db = self._read_db()
        return db.get(collection, [])

    async def get_by_id(self, collection: str, item_id: str) -> Optional[Dict[str, Any]]:
        items = await self.get_all(collection)
        return next((item for item in items if item.get("id") == item_id), None)

    async def create(self, collection: str, data: Dict[str, Any]) -> Dict[str, Any]:
        db = self._read_db()
        if collection not in db:
            db[collection] = []
        db[collection].append(data)
        self._write_db(db)
        return data

    async def update(self, collection: str, item_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        db = self._read_db()
        items = db.get(collection, [])
        for i, item in enumerate(items):
            if item.get("id") == item_id:
                items[i].update(data)
                self._write_db(db)
                return items[i]
        return data

class FirestoreRepository(BaseRepository):
    def __init__(self):
        settings = get_settings()
        if not firebase_admin._apps:
            cred_path = settings.google_application_credentials
            cred_json = settings.google_application_credentials_json
            if cred_json:
                cred = credentials.Certificate(json.loads(cred_json))
                firebase_admin.initialize_app(cred, {
                    'projectId': settings.firebase_project_id,
                })
            elif cred_path and os.path.exists(cred_path):
                cred = credentials.Certificate(cred_path)
                firebase_admin.initialize_app(cred, {
                    'projectId': settings.firebase_project_id,
                })
            else:
                # Fallback for Cloud environment where credentials are automatically handled
                firebase_admin.initialize_app()
        self.db = admin_firestore.client()

    async def get_all(self, collection: str) -> List[Dict[str, Any]]:
        docs = self.db.collection(collection).stream()
        return [doc.to_dict() for doc in docs]

    async def get_by_id(self, collection: str, item_id: Any) -> Optional[Dict[str, Any]]:
        doc = self.db.collection(collection).document(str(item_id)).get()
        return doc.to_dict() if doc.exists else None

    async def create(self, collection: str, data: Dict[str, Any]) -> Dict[str, Any]:
        item_id = data.get("id")
        if item_id:
            self.db.collection(collection).document(str(item_id)).set(data)
        else:
            _, doc_ref = self.db.collection(collection).add(data)
            data["id"] = doc_ref.id
            doc_ref.update({"id": doc_ref.id})
        return data

    async def update(self, collection: str, item_id: Any, data: Dict[str, Any]) -> Dict[str, Any]:
        self.db.collection(collection).document(str(item_id)).update(data)
        return (await self.get_by_id(collection, item_id)) or data

def get_repository() -> BaseRepository:
    settings = get_settings()
    # In a real app, you might decide which repo to use based on env vars
    # For now, if Firestore credentials exist, use Firestore, otherwise fallback to JSON
    if settings.google_application_credentials_json or (settings.google_application_credentials and os.path.exists(settings.google_application_credentials)):
        try:
            return FirestoreRepository()
        except Exception as e:
            print(f"Failed to initialize Firestore: {e}. Falling back to JSON repository.")
            return JSONRepository()
    return JSONRepository()
