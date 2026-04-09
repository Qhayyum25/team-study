import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function seed() {
  try {
    // Seed demo users
    await pool.query(`
      INSERT INTO users (name, email, password, role) VALUES
        ('Rahul', 'rahul@kits.edu', '123', 'student'),
        ('Priya', 'priya@kits.edu', '123', 'student'),
        ('Admin', 'admin@kits.edu', 'admin', 'admin')
      ON CONFLICT (email) DO NOTHING
    `);

    // Seed a demo group
    const rahul = await pool.query(`SELECT id FROM users WHERE email = 'rahul@kits.edu'`);
    if (rahul.rows.length > 0) {
      const rahulId = rahul.rows[0].id;
      await pool.query(`
        INSERT INTO groups (name, subject, topic, exam_target, created_by) VALUES
          ('DBMS Exam Prep', 'DBMS', 'Normalization + SQL', 'End Sem', $1)
        ON CONFLICT DO NOTHING
      `, [rahulId]);

      // Add Rahul as member of the group
      const group = await pool.query(`SELECT id FROM groups WHERE name = 'DBMS Exam Prep'`);
      if (group.rows.length > 0) {
        await pool.query(`
          INSERT INTO members (user_id, group_id) VALUES ($1, $2)
          ON CONFLICT DO NOTHING
        `, [rahulId, group.rows[0].id]);
      }
    }

    const res = await pool.query('SELECT id, name, email, role FROM users');
    console.log('Seeded demo users successfully!');
    console.log('Users in database:');
    res.rows.forEach(u => console.log(`  - ${u.name} (${u.email}) [${u.role}]`));

    const groups = await pool.query('SELECT id, name, subject FROM groups');
    console.log('Groups in database:');
    groups.rows.forEach(g => console.log(`  - ${g.name} (${g.subject})`));
  } catch (e) {
    console.error('Seed error:', e.message);
  } finally {
    await pool.end();
  }
}

seed();
