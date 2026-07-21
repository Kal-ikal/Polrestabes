-- =========================================================
-- SEED DATA: Dummy Assets for Testing
-- =========================================================

-- Insert Dummy Assets
INSERT INTO assets (code, name, serial_number, status, qr_code_url) VALUES
('HT-001', 'Motorola XIR P8668i', 'SN-MOT-001', 'tersedia', 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=HT-001'),
('HT-002', 'Motorola XIR P8668i', 'SN-MOT-002', 'dipinjam', 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=HT-002'),
('HT-003', 'Icom IC-V80', 'SN-IC-003', 'rusak', 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=HT-003'),
('HT-004', 'Baofeng UV-5R', 'SN-BF-004', 'tersedia', 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=HT-004')
ON CONFLICT (code) DO NOTHING;

-- =========================================================
-- CREATE ADMIN INSTRUCTIONS
-- =========================================================
-- 1. Create a user via the Supabase Authentication Dashboard or Register via the App.
-- 2. Once the user is created, copy their User ID (UUID).
-- 3. Run the following command in the SQL Editor to make them an admin:
-- UPDATE profiles SET role = 'admin' WHERE id = 'YOUR_USER_ID_HERE';
