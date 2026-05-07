const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// MySQL 연결
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "0717",
    database: "keep",
});

db.connect((err) => {
    if (err) {
        console.error("DB 연결 실패:", err);
    } else {
        console.log("MySQL 연결 성공");
    }
});

// ------------------------------
// POST 요청 저장
// ------------------------------
app.post("/api/requests", (req, res) => {
    console.log("POST 요청 들어옴:", req.body);

    const {
        product_id,
        product_name,
        color,
        size,
        fitting_room_id,
        status,
        session_id
    } = req.body;

    const sql = `
        INSERT INTO requests
        (productId, productName, color, size, fittingRoomId, status, requestTime, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    db.query(
        sql,
        [
            product_id,
            product_name,
            color,
            size,
            fitting_room_id,
            status
        ],
        (err, result) => {
            if (err) {
                console.error("INSERT 실패:", err);
                return res.status(500).json({ error: err });
            }

            res.json({
                request_id: result.insertId,
                product_id,
                product_name,
                color,
                size,
                fitting_room_id,
                status,
                request_time: new Date().toISOString(),
                session_id
            });
        }
    );
});

// ------------------------------
// GET 전체 조회
// ------------------------------
app.get("/api/requests", (req, res) => {
    db.query("SELECT * FROM requests", (err, results) => {
        if (err) {
            console.error("조회 실패:", err);
            return res.status(500).json({ error: err });
        }

        res.json({ requests: results });
    });
});

// ------------------------------
// PATCH 상태 변경 (⭐ 추가된 부분)
// ------------------------------
app.patch("/api/requests/:id", (req, res) => {
    console.log("PATCH 요청 들어옴:", req.params, req.body);

    const { id } = req.params;
    const { status } = req.body;

    const sql = `
        UPDATE requests
        SET status = ?, updatedAt = NOW()
        WHERE requestId = ?
    `;

    db.query(sql, [status, id], (err) => {
        if (err) {
            console.error("UPDATE 실패:", err);
            return res.status(500).json({ error: err });
        }

        res.json({
            request_id: id,
            status
        });
    });
});

// ------------------------------
// 서버 실행
// ------------------------------
app.listen(3000, () => {
    console.log("서버 실행중: http://localhost:3000");
});