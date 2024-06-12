/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
    pgm.dropColumn("exam_access", ["adminId", "examId"], { ifExists: true });
    pgm.addColumn(
        "exam_access",
        {
            admin_id: {
                type: "UUID",
                notNull: true,
                references: "admin(id)",
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            },
            exam_id: {
                type: "UUID",
                notNull: true,
                references: "exam(id)",
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            },
        },
        { ifNotExists: true }
    );
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    pgm.addColumn(
        "exam_access",
        {
            adminId: {
                type: "UUID",
                notNull: true,
                references: "admin(id)",
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            },
            examId: {
                type: "UUID",
                notNull: true,
                references: "exam(id)",
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            },
        },
        { ifNotExists: true }
    );
    pgm.dropColumn("exam_access", ["admin_id", "exam_id"], { ifExists: true });
};
