-- Add company_id columns
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS company_id INTEGER REFERENCES companies(id);
ALTER TABLE assessment_attempts ADD COLUMN IF NOT EXISTS company_id INTEGER REFERENCES companies(id);
ALTER TABLE user_certifications ADD COLUMN IF NOT EXISTS company_id INTEGER REFERENCES companies(id);
ALTER TABLE badges ADD COLUMN IF NOT EXISTS company_id INTEGER REFERENCES companies(id);
ALTER TABLE user_badges ADD COLUMN IF NOT EXISTS company_id INTEGER REFERENCES companies(id);
ALTER TABLE assessment_questions ADD COLUMN IF NOT EXISTS company_id INTEGER REFERENCES companies(id);
ALTER TABLE assessment_answers ADD COLUMN IF NOT EXISTS company_id INTEGER REFERENCES companies(id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_assessments_company_id ON assessments(company_id);
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_company_id ON assessment_attempts(company_id);
CREATE INDEX IF NOT EXISTS idx_user_certifications_company_id ON user_certifications(company_id);
CREATE INDEX IF NOT EXISTS idx_badges_company_id ON badges(company_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_company_id ON user_badges(company_id);
CREATE INDEX IF NOT EXISTS idx_assessment_questions_company_id ON assessment_questions(company_id);
CREATE INDEX IF NOT EXISTS idx_assessment_answers_company_id ON assessment_answers(company_id);

-- Migrate existing data to default company (ID: 2)
UPDATE assessments SET company_id = 2 WHERE company_id IS NULL;
UPDATE assessment_attempts SET company_id = 2 WHERE company_id IS NULL;
UPDATE user_certifications SET company_id = 2 WHERE company_id IS NULL;
UPDATE badges SET company_id = 2 WHERE company_id IS NULL;
UPDATE user_badges SET company_id = 2 WHERE company_id IS NULL;

UPDATE assessment_questions aq
SET company_id = a.company_id
FROM assessments a
WHERE aq.assessment_id = a.id AND aq.company_id IS NULL;

UPDATE assessment_answers aa
SET company_id = at.company_id
FROM assessment_attempts at
WHERE aa.attempt_id = at.id AND aa.company_id IS NULL;