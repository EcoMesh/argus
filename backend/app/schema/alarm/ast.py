from typing import Annotated, List, Literal

from pydantic import BaseModel, Field, RootModel

from .rules import Rules


class Rule(BaseModel):
    type: Literal["rule"]
    rule: Rules


class And(BaseModel):
    type: Literal["and"]
    tests: List["Node"]


class Or(BaseModel):
    type: Literal["or"]
    tests: List["Node"]


Node = Annotated[Rule | And | Or, Field(discriminator="type")]

Or.model_rebuild()
And.model_rebuild()

Root = RootModel[Node]
