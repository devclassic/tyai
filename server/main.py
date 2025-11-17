from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api import router

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

app.include_router(router)

if __name__ == "__main__":
    import multiprocessing
    import uvicorn

    multiprocessing.freeze_support()
    uvicorn.run(app, host="0.0.0.0", port=7800)
