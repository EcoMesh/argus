import typer

from . import groups

app = typer.Typer(help="A collation of commands to help with development.")

app.add_typer(groups.db, name="db")
