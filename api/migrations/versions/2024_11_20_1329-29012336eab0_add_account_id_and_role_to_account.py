"""Add account_id and role to account

Revision ID: 29012336eab0
Revises: 43fa78bc3b7d
Create Date: 2024-11-20 13:29:29.380840

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import ENUM
from sqlalchemy.dialects.postgresql import UUID  # Importando o tipo UUID

# revision identifiers, used by Alembic.
revision = '29012336eab0'
down_revision = '43fa78bc3b7d'
branch_labels = None
depends_on = None


def upgrade():
    # Adicionando a coluna account_id e role na tabela accounts
    with op.batch_alter_table("accounts") as batch_op:
        batch_op.add_column(
            sa.Column(
                "account_id",
                UUID(as_uuid=True),
                sa.ForeignKey("accounts.id", ondelete="SET NULL"),
                nullable=True
            )
        )
        batch_op.add_column(
            sa.Column(
                "role",
                sa.String(length=255),
                nullable=True,
                server_default="admin"
            )
        )

def downgrade():
    # Removendo as colunas adicionadas
    with op.batch_alter_table("accounts") as batch_op:
        batch_op.drop_column("role")
        batch_op.drop_column("account_id")
    op.execute("DROP TYPE role_enum;")  # Remove o tipo ENUM criado