from invoke import task


@task
def dev(c):
    c.run("uvicorn main:app --host 0.0.0.0 --port 7800 --reload")


@task
def build(c):
    c.run("pyinstaller -F main.py")
