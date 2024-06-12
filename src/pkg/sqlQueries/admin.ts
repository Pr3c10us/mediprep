export const AddAdminQuery = `INSERT INTO admin (name,email,password,roles,exam_access) VALUES ($1,$2,$3,$4,$5)`;
export const GetAdminsWithFilterQuery = `
SELECT
    a.id AS admin_id,
    a.name AS admin_name,
    a.email AS admin_email,
    a.roles AS admin_roles,
    a.created_at AS admin_created_at,
    a.updated_at AS admin_updated_at,
    json_agg(
            json_build_object(
                    'id', e.id,
                    'name', e.name,
                    'description', e.description,
                    'image_url', e.image_url
            )
    ) AS exams
FROM
    admin a
        LEFT JOIN
    exam_access ea ON a.id = ea.admin_id
        LEFT JOIN
    exam e ON ea.exam_id = e.id
WHERE
    ($3::text IS NULL OR a.name ILIKE '%' || $3 || '%')
  AND ($4::text IS NULL OR a.email ILIKE '%' || $4 || '%')
GROUP BY
    a.created_at, a.name, a.email, a.roles, a.id, a.updated_at
ORDER BY
    a.created_at
LIMIT $1 OFFSET $2;
`;
export const GetAdminByIDQuery = `SELECT
    a.id AS admin_id,
    a.name AS admin_name,
    a.email AS admin_email,
    a.password AS admin_password,
    a.roles AS admin_roles,
    a.created_at AS admin_created_at,
    a.updated_at AS admin_updated_at,
    json_agg(
            json_build_object(
                    'id', e.id,
                    'name', e.name,
                    'description', e.description,
                    'image_url', e.image_url
            )
    ) AS exams
FROM
    admin a
        LEFT JOIN
    exam_access ea ON a.id = ea.admin_id
        LEFT JOIN
    exam e ON ea.exam_id = e.id
WHERE a.id=$1
GROUP BY
    a.created_at, a.name, a.email, a.roles, a.id, a.updated_at;`;
export const GetAdminByEmailQuery = `SELECT
    a.id AS admin_id,
    a.name AS admin_name,
    a.email AS admin_email,
    a.password AS admin_password,
    a.roles AS admin_roles,
    a.created_at AS admin_created_at,
    a.updated_at AS admin_updated_at,
    json_agg(
            json_build_object(
                    'id', e.id,
                    'name', e.name,
                    'description', e.description,
                    'image_url', e.image_url
            )
    ) AS exams
FROM
    admin a
        LEFT JOIN
    exam_access ea ON a.id = ea.admin_id
        LEFT JOIN
    exam e ON ea.exam_id = e.id
WHERE a.email=$1
GROUP BY
    a.created_at, a.name, a.email, a.roles, a.id, a.updated_at;`;
