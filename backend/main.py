from fastapi import FastAPI
from pydantic import BaseModel

# Initialize the FastAPI application
app = FastAPI(title="My Website Backend")

# Define a data model for incoming requests
class UserRequest(BaseModel):
    prompt: str

@app.get("/")
async def read_root():
    """Health check endpoint to verify the API is running."""
    return {"status": "online", "message": "Welcome to the backend!"}

@app.post("/api/chat")
async def chat_endpoint(request: UserRequest):
    """
    Example endpoint where you could integrate Gemini AI.
    Currently, it just echoes back the prompt.
    """
    # TODO: Integrate with google.ai.generativelanguage here
    response_text = f"You said: {request.prompt}"
    return {"response": response_text}