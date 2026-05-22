-- Performance optimization indexes
-- Run this in Supabase SQL Editor to speed up queries

-- Quiz sessions: frequently queried by session_code and status
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_code ON quiz_sessions(session_code);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_status ON quiz_sessions(status);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_quiz_id ON quiz_sessions(quiz_id);

-- Participants: frequently queried by session_id
CREATE INDEX IF NOT EXISTS idx_participants_session_id ON participants(session_id);
CREATE INDEX IF NOT EXISTS idx_participants_nickname ON participants(session_id, nickname);

-- Questions: frequently queried by quiz_id and order
CREATE INDEX IF NOT EXISTS idx_questions_quiz_id_order ON questions(quiz_id, order_index);

-- Answers: frequently queried by participant_id and question_id
CREATE INDEX IF NOT EXISTS idx_answers_participant_id ON answers(participant_id);
CREATE INDEX IF NOT EXISTS idx_answers_question_id ON answers(question_id);
CREATE INDEX IF NOT EXISTS idx_answers_session_id ON answers(session_id);

-- Composite index for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_answers_session_score ON answers(session_id, score DESC, answered_at ASC);
