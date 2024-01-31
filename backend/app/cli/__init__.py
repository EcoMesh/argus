import typer

from .groups import apps

app = typer.Typer(help="A collation of commands to help with development.")

for sub_app in apps:
    app.add_typer(sub_app)
