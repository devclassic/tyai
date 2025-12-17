from invoke import task


@task
def build(ctx):
    ctx.run(
        "pyinstaller -F --collect-all torch --collect-all triton --collect-all sam3 --collect-all numpy --collect-all decord main.py"
    )
