"""Create sessions, proposals, and shared rate-limit buckets."""

from alembic import op
import sqlalchemy as sa

revision = "20261018_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    tables = set(inspector.get_table_names())
    if "sessions" not in tables:
        op.create_table(
            "sessions",
            sa.Column("token", sa.String(), nullable=False),
            sa.Column("created", sa.Float(), nullable=False),
            sa.Column("calls", sa.Integer(), nullable=False, server_default="0"),
            sa.PrimaryKeyConstraint("token"),
        )
    if "proposals" not in tables:
        op.create_table(
            "proposals",
            sa.Column("id", sa.String(), nullable=False),
            sa.Column("owner", sa.String(), nullable=False),
            sa.Column("data", sa.JSON(), nullable=False),
            sa.Column("state", sa.String(), nullable=False, server_default="PROPOSED"),
            sa.Column("order_id", sa.String(), nullable=True),
            sa.Column("created", sa.Float(), nullable=False),
            sa.Column("audit", sa.JSON(), nullable=False),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("order_id"),
        )
    indexes = {item["name"] for item in inspector.get_indexes("proposals")}
    if "ix_proposals_owner_created" not in indexes:
        op.create_index("ix_proposals_owner_created", "proposals", ["owner", "created"])
    if "rate_limit_buckets" not in tables:
        op.create_table(
            "rate_limit_buckets",
            sa.Column("key", sa.String(), nullable=False),
            sa.Column("count", sa.Integer(), nullable=False, server_default="0"),
            sa.Column("expires", sa.Float(), nullable=False),
            sa.PrimaryKeyConstraint("key"),
        )


def downgrade() -> None:
    op.drop_table("rate_limit_buckets")
    op.drop_index("ix_proposals_owner_created", table_name="proposals")
    op.drop_table("proposals")
    op.drop_table("sessions")
