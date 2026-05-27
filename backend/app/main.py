from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.features.company.presentation import initialize_sample_data as initialize_company_data
from app.features.company.presentation import router as company_router
from app.features.country.presentation import initialize_sample_data as initialize_country_data
from app.features.country.presentation import router as country_router
from app.features.user.presentation import initialize_sample_data
from app.features.user.presentation import router as user_router

load_dotenv()

app = FastAPI(title="API", version="1.0.0")

origins = [
    "http://localhost",
    "http://localhost:4000",
    "http://127.0.0.1:4000",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    await initialize_sample_data()
    await initialize_country_data()
    await initialize_company_data()


@app.get("/")
async def root():
    return {"status": "success", "data": {"message": "Welcome to the API"}}


@app.get("/health")
async def health():
    return {"status": "success", "data": {"status": "ok"}}


app.include_router(user_router, prefix="/v1", tags=["users"])
app.include_router(country_router, prefix="/v1", tags=["countries"])
app.include_router(company_router, prefix="/v1", tags=["companies"])
