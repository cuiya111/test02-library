-- =====================================================================
-- 图书馆管理系统 · 数据库建库建表脚本
-- 数据库：web_library
-- 目标版本：MySQL 5.7（InnoDB / utf8mb4）
-- 说明：字段命名与前端 src/api/library.js 中数据实体一一对应
-- =====================================================================

CREATE DATABASE IF NOT EXISTS web_library
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_general_ci;

USE web_library;

-- ---------------------------------------------------------------------
-- 1. 学生表 students
--    对应前端实体：students { id, name, studentNo, major, className, phone, createdAt }
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS borrows;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS books;

CREATE TABLE IF NOT EXISTS students (
  id          INT UNSIGNED     NOT NULL AUTO_INCREMENT COMMENT '主键自增id',
  name        VARCHAR(50)      NOT NULL                COMMENT '学生姓名',
  student_no  VARCHAR(20)      NOT NULL                COMMENT '学号，唯一',
  major       VARCHAR(50)      DEFAULT NULL            COMMENT '专业',
  class_name  VARCHAR(50)      DEFAULT NULL            COMMENT '班级',
  phone       VARCHAR(20)      DEFAULT NULL            COMMENT '联系电话',
  created_at  DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (id),
  UNIQUE KEY uk_student_no (student_no),
  KEY idx_student_name (name)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '学生信息表';

-- ---------------------------------------------------------------------
-- 2. 图书表 books
--    对应前端实体：books { id, title, author, isbn, category, publisher, total, available, createdAt }
--    total=总库存，available=可借数量（必须 <= total，由业务层保证）
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS books (
  id          INT UNSIGNED    NOT NULL AUTO_INCREMENT COMMENT '主键自增id',
  title       VARCHAR(100)    NOT NULL                COMMENT '书名',
  author      VARCHAR(50)     NOT NULL                COMMENT '作者',
  isbn        VARCHAR(20)     DEFAULT NULL            COMMENT 'ISBN',
  category    VARCHAR(30)     DEFAULT NULL            COMMENT '分类，如 计算机/文学',
  publisher   VARCHAR(50)     DEFAULT NULL            COMMENT '出版社',
  total       INT UNSIGNED    NOT NULL DEFAULT 1      COMMENT '总库存',
  available   INT UNSIGNED    NOT NULL DEFAULT 0      COMMENT '可借数量',
  created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (id),
  UNIQUE KEY uk_isbn (isbn),
  KEY idx_book_title (title)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '图书信息表';

-- ---------------------------------------------------------------------
-- 3. 借阅记录表 borrows
--    对应前端实体：borrows { id, studentId, bookId, borrowTime, dueTime, returnTime }
--    return_time 为 NULL 表示尚未归还
--    外键使用 RESTRICT：存在借阅记录的学生/图书不允许直接删除（与前端逻辑一致）
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS borrows (
  id           INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键自增id',
  student_id   INT UNSIGNED NOT NULL                COMMENT '借阅学生id',
  book_id      INT UNSIGNED NOT NULL                COMMENT '借阅图书id',
  borrow_time  DATETIME     NOT NULL                COMMENT '借出时间',
  due_time     DATETIME     NOT NULL                COMMENT '应还时间',
  return_time  DATETIME     DEFAULT NULL            COMMENT '归还时间，NULL=未归还',
  PRIMARY KEY (id),
  KEY idx_borrow_student (student_id),
  KEY idx_borrow_book (book_id),
  KEY idx_borrow_status (return_time),
  CONSTRAINT fk_borrow_student FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_borrow_book    FOREIGN KEY (book_id)    REFERENCES books (id)    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '图书借阅记录表';

-- =====================================================================
-- 可选：示例数据（测试用，不需要可删除本段）
-- =====================================================================
INSERT INTO students (id, name, student_no, major, class_name, phone) VALUES
  (1, '张伟', '2024001', '计算机科学', '计科2301', '13800001001'),
  (2, '李娜', '2024002', '软件工程',   '软工2302', '13800001002'),
  (3, '王芳', '2024003', '信息管理',   '信管2301', '13800001003');

INSERT INTO books (id, title, author, isbn, category, publisher, total, available) VALUES
  (1, '深入理解计算机系统', 'Randal E. Bryant', '9787111544937', '计算机', '机械工业出版社', 5, 3),
  (2, '算法导论',           'Thomas H. Cormen', '9787111407010', '计算机', '机械工业出版社', 3, 2),
  (3, '活着',               '余华',             '9787506365437', '文学',   '作家出版社',     6, 4),
  (4, '百年孤独',           '加西亚·马尔克斯',   '9787544253994', '文学',   '南海出版公司',   4, 2);

INSERT INTO borrows (student_id, book_id, borrow_time, due_time, return_time) VALUES
  (1, 1, '2026-10-15 09:00:00', '2026-11-14 09:00:00', NULL),
  (2, 3, '2026-10-06 09:00:00', '2026-11-05 09:00:00', NULL),
  (3, 4, '2026-09-16 09:00:00', '2026-10-16 09:00:00', '2026-10-21 09:00:00');
