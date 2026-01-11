-- =====================================================
-- ASSESSMENTS SYSTEM TABLES FOR POSTGRESQL
-- =====================================================

-- 1. Assessments Table
CREATE TABLE IF NOT EXISTS assessments (
    id SERIAL PRIMARY KEY,
    sop_id VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    passing_score INTEGER DEFAULT 80,
    time_limit INTEGER, -- minutes, NULL if no limit
    total_points INTEGER,
    active BOOLEAN DEFAULT true,
    mandatory BOOLEAN DEFAULT false,
    difficulty VARCHAR(50) DEFAULT 'intermediate',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_difficulty CHECK (difficulty IN ('beginner', 'intermediate', 'advanced'))
);

-- 2. Assessment Questions Table
CREATE TABLE IF NOT EXISTS assessment_questions (
    id SERIAL PRIMARY KEY,
    assessment_id INTEGER NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    question_id VARCHAR(50) NOT NULL,
    question_type VARCHAR(50) NOT NULL,
    question_text TEXT NOT NULL,
    options JSONB, -- Array of options for multiple choice
    correct_answer JSONB NOT NULL, -- String or Array
    explanation TEXT,
    points INTEGER DEFAULT 1,
    category VARCHAR(100),
    question_order INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_question_type CHECK (question_type IN ('multiple-choice', 'true-false', 'scenario')),
    UNIQUE(assessment_id, question_id)
);

-- 3. Assessment Attempts Table
CREATE TABLE IF NOT EXISTS assessment_attempts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assessment_id INTEGER NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    sop_id VARCHAR(100) NOT NULL,
    started_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    score NUMERIC(5,2), -- Percentage (0-100)
    points_earned INTEGER,
    total_points INTEGER,
    passed BOOLEAN,
    time_taken INTEGER, -- seconds
    attempt_number INTEGER DEFAULT 1,
    status VARCHAR(50) DEFAULT 'in-progress',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_status CHECK (status IN ('in-progress', 'completed', 'abandoned'))
);

-- 4. Assessment Answers Table (stores individual question answers)
CREATE TABLE IF NOT EXISTS assessment_answers (
    id SERIAL PRIMARY KEY,
    attempt_id INTEGER NOT NULL REFERENCES assessment_attempts(id) ON DELETE CASCADE,
    question_id VARCHAR(50) NOT NULL,
    user_answer JSONB, -- String or Array
    correct_answer JSONB,
    correct BOOLEAN,
    points_earned INTEGER,
    points_possible INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. User Certifications Table
CREATE TABLE IF NOT EXISTS user_certifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sop_id VARCHAR(100) NOT NULL,
    assessment_id INTEGER NOT NULL REFERENCES assessments(id),
    attempt_id INTEGER NOT NULL REFERENCES assessment_attempts(id),
    score NUMERIC(5,2) NOT NULL,
    certified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    certificate_number VARCHAR(50) UNIQUE,
    certificate_url TEXT,
    valid BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, sop_id)
);

-- 6. Badges Table
CREATE TABLE IF NOT EXISTS badges (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(10), -- emoji or icon name
    badge_type VARCHAR(50) DEFAULT 'achievement',
    criteria_type VARCHAR(100),
    criteria_value JSONB,
    rarity VARCHAR(50) DEFAULT 'common',
    points INTEGER DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_badge_type CHECK (badge_type IN ('achievement', 'milestone', 'special')),
    CONSTRAINT valid_rarity CHECK (rarity IN ('common', 'rare', 'epic', 'legendary'))
);

-- 7. User Badges Table
CREATE TABLE IF NOT EXISTS user_badges (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_id INTEGER NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assessment_id INTEGER REFERENCES assessments(id),
    attempt_id INTEGER REFERENCES assessment_attempts(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, badge_id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_assessments_sop_id ON assessments(sop_id);
CREATE INDEX idx_assessments_active ON assessments(active);

CREATE INDEX idx_questions_assessment_id ON assessment_questions(assessment_id);
CREATE INDEX idx_questions_question_id ON assessment_questions(question_id);

CREATE INDEX idx_attempts_user_id ON assessment_attempts(user_id);
CREATE INDEX idx_attempts_assessment_id ON assessment_attempts(assessment_id);
CREATE INDEX idx_attempts_sop_id ON assessment_attempts(sop_id);
CREATE INDEX idx_attempts_user_sop ON assessment_attempts(user_id, sop_id);
CREATE INDEX idx_attempts_status ON assessment_attempts(status);

CREATE INDEX idx_answers_attempt_id ON assessment_answers(attempt_id);
CREATE INDEX idx_answers_question_id ON assessment_answers(question_id);

CREATE INDEX idx_certifications_user_id ON user_certifications(user_id);
CREATE INDEX idx_certifications_sop_id ON user_certifications(sop_id);

CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_user_badges_badge_id ON user_badges(badge_id);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_assessments_updated_at BEFORE UPDATE ON assessments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attempts_updated_at BEFORE UPDATE ON assessment_attempts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_certifications_updated_at BEFORE UPDATE ON user_certifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_badges_updated_at BEFORE UPDATE ON badges
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNCTION TO GENERATE CERTIFICATE NUMBER
-- =====================================================

CREATE OR REPLACE FUNCTION generate_certificate_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.certificate_number IS NULL THEN
        NEW.certificate_number := 'CERT-' || 
                                  EXTRACT(YEAR FROM CURRENT_TIMESTAMP)::TEXT || 
                                  '-' || 
                                  LPAD(floor(random() * 10000)::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER generate_cert_number BEFORE INSERT ON user_certifications
    FOR EACH ROW EXECUTE FUNCTION generate_certificate_number();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE assessments IS 'Stores assessment definitions for each SOP';
COMMENT ON TABLE assessment_questions IS 'Stores questions for each assessment';
COMMENT ON TABLE assessment_attempts IS 'Tracks user attempts at assessments';
COMMENT ON TABLE assessment_answers IS 'Stores answers for each question in an attempt';
COMMENT ON TABLE user_certifications IS 'Tracks certified users for each SOP';
COMMENT ON TABLE badges IS 'Defines achievement badges';
COMMENT ON TABLE user_badges IS 'Tracks badges earned by users';