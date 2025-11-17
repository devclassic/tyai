import dataset

db = dataset.connect("sqlite:///data/data.db")

types = db["types"]
