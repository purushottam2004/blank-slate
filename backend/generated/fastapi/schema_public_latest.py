import datetime

from pydantic import UUID4, BaseModel, Field

# CUSTOM CLASSES
# Note: These are custom model classes for defining common features among
# Pydantic Base Schema.


class CustomModel(BaseModel):
    """Base model class with common features."""

    pass


class CustomModelInsert(CustomModel):
    """Base model for insert operations with common features."""

    pass


class CustomModelUpdate(CustomModel):
    """Base model for update operations with common features."""

    pass


# BASE CLASSES
# Note: These are the base Row models that include all fields.


class UsersBaseSchema(CustomModel):
    """Users Base Schema."""

    # Primary Keys
    id: UUID4

    # Columns
    created_at: datetime.datetime
    display_name: str | None = Field(default=None)
    updated_at: datetime.datetime
    username: str | None = Field(default=None)


# INSERT CLASSES
# Note: These models are used for insert operations. Auto-generated fields
# (like IDs and timestamps) are optional.


class UsersInsert(CustomModelInsert):
    """Users Insert Schema."""

    # Primary Keys
    id: UUID4

    # Field properties:
    # created_at: has default value
    # display_name: nullable
    # updated_at: has default value
    # username: nullable

    # Optional fields
    created_at: datetime.datetime | None = Field(default=None)
    display_name: str | None = Field(default=None)
    updated_at: datetime.datetime | None = Field(default=None)
    username: str | None = Field(default=None)


# UPDATE CLASSES
# Note: These models are used for update operations. All fields are optional.


class UsersUpdate(CustomModelUpdate):
    """Users Update Schema."""

    # Primary Keys
    id: UUID4 | None = Field(default=None)

    # Field properties:
    # created_at: has default value
    # display_name: nullable
    # updated_at: has default value
    # username: nullable

    # Optional fields
    created_at: datetime.datetime | None = Field(default=None)
    display_name: str | None = Field(default=None)
    updated_at: datetime.datetime | None = Field(default=None)
    username: str | None = Field(default=None)


# OPERATIONAL CLASSES


class Users(UsersBaseSchema):
    """Users Schema for Pydantic.

    Inherits from UsersBaseSchema. Add any customization here.
    """

    pass
