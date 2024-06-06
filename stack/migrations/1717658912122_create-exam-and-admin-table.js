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
    pgm.createExtension("uuid-ossp", { ifNotExists: true });

    pgm.createTable("admin", {
        id: {
            type: "UUID",
            primaryKey: true,
            default: pgm.func("uuid_generate_v4()"),
        },
        name: {
            type: "varchar(32)",
            notNull: true,
        },
        email: {
            type: "varchar(128)",
            notNull: true,
            unique: true,
        },
        roles: {
            type: "VARCHAR(32)[]",
            notNull: true,
            default: pgm.func('ARRAY["viewer"]::VARCHAR(32)[]'),
        },
        created_at: {
            type: "timestamp",
            notNull: true,
            default: pgm.func("current_timestamp"),
        },
        updated_at: {
            type: "timestamp",
            notNull: true,
            default: pgm.func("current_timestamp"),
        },
    });

    pgm.createTable("exam", {
        id: {
            type: "UUID",
            primaryKey: true,
            default: pgm.func("uuid_generate_v4()"),
        },
        name: {
            type: "VARCHAR(64)",
            notNull: true,
            unique: true,
        },
        description: {
            type: "TEXT",
            notNull: true,
        },
        image_url: {
            type: "VARCHAR(256)",
            notNull: true,
        },
    });

    pgm.createTable("exam_access", {
        id: {
            type: "UUID",
            primaryKey: true,
            default: pgm.func("uuid_generate_v4()"),
        },
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
    });

    // Create a function to update updated_at column
    pgm.createFunction(
        "set_updated_at",
        [],
        {
            language: "plpgsql",
            returns: "trigger",
        },
        `
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    `
    );

    // Create a trigger to call the function before update
    pgm.createTrigger("admin", "before_update_set_updated_at", {
        when: "BEFORE",
        operation: "UPDATE",
        function: "set_updated_at",
        level: "ROW",
    });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    pgm.dropTrigger("admin", "before_update_set_updated_at");
    pgm.dropFunction("set_updated_at");
    pgm.dropExtension("uuid-ossp", { ifExists: true });

    pgm.dropTable("admin");
    pgm.dropTable("exam");
    pgm.dropTable("exam_access");
};
