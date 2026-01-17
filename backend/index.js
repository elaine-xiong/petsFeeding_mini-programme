const express = require('express');
const db = require('./db');

// const cors = require('cors');
// app.use(cors());

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to the backend server! Server is running on port 3300');
});

// // 测试数据库连接
// app.get('/test', async (req, res) => {
//   try {
//     const [rows] = await db.query('SELECT 1 + 1 AS result');
//     res.json({ success: true, result: rows[0].result });
//   } catch (err) {
//     res.json({ success: false, error: err.message });
//   }
// });
//===============users======================
// 获取数据
app.get('/users', async (req, res) => {
  console.log('收到 POST /users 请求');
  console.log('body:', req.body);
  try {
    const [rows] = await db.query("SELECT * FROM users");
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
//添加数据
app.post('/users', async (req, res) => {
  // const { openid, nickname, avatarUrl } = req.body;
  const { nickname, avatarUrl } = req.body;

  // if (!openid) {
  //   return res.status(400).json({ success: false, error: "openid is required" });
  // }
  
  try {
    // await db.query(
    //   "INSERT INTO users (openid, nickname, avatarUrl) VALUES (?, ?, ?)",
    //   [openid, nickname, avatarUrl]
    // );
    await db.query(
  "INSERT INTO users (nickname, avatar_url) VALUES (?, ?)",
  [nickname, avatarUrl]
);


    res.json({ success: true, message: "User added" });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ================= pets =================

// 获取某个用户的所有宠物
app.get('/pets', async (req, res) => {
  const { user_id } = req.query;

  try {
    const [rows] = await db.query(
      'SELECT * FROM pets WHERE user_id = ?',
      [user_id]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 添加宠物
app.post('/pets', async (req, res) => {
  const { id, user_id, name, max_feedings_per_day, feeding_amount, avatar_url } = req.body;

  // 验证必填字段
  if (!id || !user_id || !name) {
    return res.status(400).json({ 
      success: false, 
      error: "id, user_id and name are required" 
    });
  }

  try {
    await db.query(
      `INSERT INTO pets 
       (id, user_id, name, max_feedings_per_day, feeding_amount, avatar_url) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, user_id, name, max_feedings_per_day, feeding_amount, avatar_url]
    );

    res.json({ success: true, message: 'Pet added' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// ================= nfc_records =================

// 添加一次 NFC 扫描记录
app.post('/nfc_records', async (req, res) => {
  const { pet_id } = req.body;

  try {
    await db.query(
      'INSERT INTO nfc_records (pet_id) VALUES (?)',
      [pet_id]
    );

    res.json({ success: true, message: 'NFC record added' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 获取某只宠物的 NFC 记录
app.get('/nfc_records', async (req, res) => {
  const { pet_id } = req.query;

  try {
    const [rows] = await db.query(
      'SELECT * FROM nfc_records WHERE pet_id = ? ORDER BY scan_time DESC',
      [pet_id]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// ================= feeding_records =================

// 添加一次喂食记录
app.post('/feeding_records', async (req, res) => {
  const { pet_id, feed_time, amount } = req.body;

  try {
    await db.query(
      'INSERT INTO feeding_records (pet_id, feed_time, amount) VALUES (?, ?, ?)',
      [pet_id, feed_time, amount]
    );

    res.json({ success: true, message: 'Feeding record added' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 获取某只宠物的喂食记录
app.get('/feeding_records', async (req, res) => {
  const { pet_id } = req.query;

  try {
    const [rows] = await db.query(
      'SELECT * FROM feeding_records WHERE pet_id = ? ORDER BY feed_time DESC',
      [pet_id]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// ================= feed_commands =================

// // 下发喂食指令
// app.post('/feed_commands', async (req, res) => {
//   const { pet_id, command_type, should_feed, timestamp } = req.body;

//   try {
//     // await db.query(
//     //   `INSERT INTO feed_commands 
//     //    (pet_id, command_type, should_feed, timestamp) 
//     //    VALUES (?, ?, ?, ?)`,
//     //   [pet_id, command_type, should_feed, timestamp]
//     // );
//     await db.query(
//       `INSERT INTO feed_commands 
//       (pet_id, command_type, should_feed, executed_at) 
//       VALUES (?, ?, ?, NOW())`,
//       [pet_id, command_type, should_feed]
//     );

//     res.json({ success: true, message: 'Command sent' });
//   } catch (err) {
//     res.status(500).json({ success: false, error: err.message });
//   }
// });

// 下发喂食指令
app.post('/feed_commands', async (req, res) => {
  const { pet_id, command_type, should_feed } = req.body;
  
  console.log('收到 feed_commands 请求:', req.body);

  try {
    // 修复 SQL 语句以匹配您的表结构
    const result = await db.query(
      `INSERT INTO feed_commands 
       (pet_id, command_type, should_feed, timestamp) 
       VALUES (?, ?, ?, NOW())`,
      [pet_id, command_type, should_feed]
    );
    
    console.log('数据库插入结果:', result);
    
    res.json({ success: true, message: 'Command sent' });
  } catch (err) {
    console.error('数据库错误详情:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message
    });
  }
});

// 获取某只宠物的指令记录
app.get('/feed_commands', async (req, res) => {
  const { pet_id } = req.query;

  try {
    const [rows] = await db.query(
      'SELECT * FROM feed_commands WHERE pet_id = ? ORDER BY timestamp DESC',
      [pet_id]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


app.listen(3300, '0.0.0.0', () => {
  console.log('Server running on port 3300')
})
