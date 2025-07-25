"""Add password reset fields to User model

Revision ID: 2d58f85f9b92
Revises: 9d4974bf7c76
Create Date: 2025-07-21 08:51:16.982671

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '2d58f85f9b92'
down_revision = '9d4974bf7c76'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.add_column(sa.Column('password_reset_token', sa.String(length=32), nullable=True))
        batch_op.add_column(sa.Column('password_reset_expires', sa.DateTime(), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.drop_column('password_reset_expires')
        batch_op.drop_column('password_reset_token')

    # ### end Alembic commands ###
