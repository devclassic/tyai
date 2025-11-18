import dataset
import os

os.makedirs("data", exist_ok=True)

db = dataset.connect("sqlite:///data/data.db")

types = db["types"]
