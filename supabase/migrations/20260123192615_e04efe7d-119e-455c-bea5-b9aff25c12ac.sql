-- Seed demo drivers across all 7 workflow steps

-- Step 1: Intake Pending (2 drivers)
INSERT INTO drivers (first_name, last_name, email, phone, gender, date_of_birth, cdl_number, cdl_state, status, current_step, payment_status, payment_hold, amount_due, amount_paid, requires_alcohol_test)
VALUES 
('Marcus', 'Johnson', 'marcus.johnson@email.com', '555-101-0001', 'Male', '1985-03-15', 'TX12345678', 'TX', 'INTAKE_PENDING', 1, 'UNPAID', false, 450.00, 0.00, false),
('Angela', 'Martinez', 'angela.martinez@email.com', '555-101-0002', 'Female', '1990-07-22', 'CA98765432', 'CA', 'INTAKE_PENDING', 1, 'UNPAID', true, 450.00, 0.00, false);

-- Step 2: Payment Stage (2 drivers)
INSERT INTO drivers (first_name, last_name, email, phone, gender, date_of_birth, cdl_number, cdl_state, status, current_step, payment_status, payment_hold, amount_due, amount_paid, requires_alcohol_test)
VALUES 
('David', 'Williams', 'david.williams@email.com', '555-102-0001', 'Male', '1982-11-08', 'FL55667788', 'FL', 'PAYMENT_HOLD', 2, 'DEPOSIT', false, 450.00, 150.00, false),
('Sarah', 'Brown', 'sarah.brown@email.com', '555-102-0002', 'Female', '1988-04-30', 'NY11223344', 'NY', 'PAYMENT_COMPLETE', 2, 'PAID', false, 450.00, 450.00, false);

-- Step 3: SAP Paperwork (2 drivers)
INSERT INTO drivers (first_name, last_name, email, phone, gender, date_of_birth, cdl_number, cdl_state, status, current_step, payment_status, payment_hold, amount_due, amount_paid, requires_alcohol_test)
VALUES 
('Michael', 'Davis', 'michael.davis@email.com', '555-103-0001', 'Male', '1979-09-12', 'AZ44556677', 'AZ', 'SAP_PAPERWORK_PENDING', 3, 'PAID', false, 450.00, 450.00, true),
('Jennifer', 'Garcia', 'jennifer.garcia@email.com', '555-103-0002', 'Female', '1992-01-25', 'NV88990011', 'NV', 'SAP_REQUEST_PENDING', 3, 'PAID', false, 450.00, 450.00, false);

-- Step 4: Clearinghouse (1 additional driver)
INSERT INTO drivers (first_name, last_name, email, phone, gender, date_of_birth, cdl_number, cdl_state, status, current_step, payment_status, payment_hold, amount_due, amount_paid, requires_alcohol_test, clearinghouse_designation_accepted)
VALUES 
('Robert', 'Miller', 'robert.miller@email.com', '555-104-0001', 'Male', '1986-06-18', 'OH22334455', 'OH', 'CLEARINGHOUSE_PENDING', 4, 'PAID', false, 450.00, 450.00, false, false);

-- Step 5: Drug Test / Donor Pass (2 drivers)
INSERT INTO drivers (first_name, last_name, email, phone, gender, date_of_birth, cdl_number, cdl_state, status, current_step, payment_status, payment_hold, amount_due, amount_paid, requires_alcohol_test, clearinghouse_designation_accepted, donor_pass_number, donor_pass_generated_at)
VALUES 
('Lisa', 'Wilson', 'lisa.wilson@email.com', '555-105-0001', 'Female', '1984-12-03', 'PA66778899', 'PA', 'DONOR_PASS_SENT', 5, 'PAID', false, 450.00, 450.00, true, true, 'DP-2024-001', NOW() - INTERVAL '2 days'),
('James', 'Anderson', 'james.anderson@email.com', '555-105-0002', 'Male', '1991-08-14', 'GA33445566', 'GA', 'DONOR_PASS_PENDING', 5, 'PAID', false, 450.00, 450.00, false, true, NULL, NULL);

-- Step 6: Test In Progress / Result Received (2 drivers)
INSERT INTO drivers (first_name, last_name, email, phone, gender, date_of_birth, cdl_number, cdl_state, status, current_step, payment_status, payment_hold, amount_due, amount_paid, requires_alcohol_test, clearinghouse_designation_accepted, donor_pass_number, donor_pass_generated_at, test_scheduled_date, test_result)
VALUES 
('Patricia', 'Taylor', 'patricia.taylor@email.com', '555-106-0001', 'Female', '1987-02-28', 'IL77889900', 'IL', 'RESULT_RECEIVED', 6, 'PAID', false, 450.00, 450.00, false, true, 'DP-2024-002', NOW() - INTERVAL '5 days', CURRENT_DATE - 3, 'NEGATIVE'),
('Christopher', 'Thomas', 'christopher.thomas@email.com', '555-106-0002', 'Male', '1983-10-07', 'MI11002233', 'MI', 'TEST_IN_PROGRESS', 6, 'PAID', false, 450.00, 450.00, true, true, 'DP-2024-003', NOW() - INTERVAL '3 days', CURRENT_DATE - 1, NULL);

-- Step 7: RTD Complete (2 drivers)
INSERT INTO drivers (first_name, last_name, email, phone, gender, date_of_birth, cdl_number, cdl_state, status, current_step, payment_status, payment_hold, amount_due, amount_paid, requires_alcohol_test, clearinghouse_designation_accepted, donor_pass_number, donor_pass_generated_at, test_scheduled_date, test_result, test_result_date, rtd_completed, rtd_completed_at)
VALUES 
('Elizabeth', 'Jackson', 'elizabeth.jackson@email.com', '555-107-0001', 'Female', '1980-05-20', 'NC44556600', 'NC', 'RTD_COMPLETE', 7, 'PAID', false, 450.00, 450.00, false, true, 'DP-2024-004', NOW() - INTERVAL '14 days', CURRENT_DATE - 10, 'NEGATIVE', CURRENT_DATE - 7, true, NOW() - INTERVAL '5 days'),
('William', 'White', 'william.white@email.com', '555-107-0002', 'Male', '1976-09-11', 'VA99887766', 'VA', 'RTD_COMPLETE', 7, 'PAID', false, 450.00, 450.00, true, true, 'DP-2024-005', NOW() - INTERVAL '21 days', CURRENT_DATE - 18, 'NEGATIVE', CURRENT_DATE - 14, true, NOW() - INTERVAL '10 days');

-- Insert payment records using correct status value: 'succeeded'
INSERT INTO payments (driver_id, amount, payment_type, payment_method_type, status, completed_at)
SELECT id, 150.00, 'deposit', 'credit_card', 'succeeded', NOW() - INTERVAL '10 days'
FROM drivers WHERE email = 'david.williams@email.com';

INSERT INTO payments (driver_id, amount, payment_type, payment_method_type, status, completed_at)
SELECT id, 450.00, 'deposit', 'credit_card', 'succeeded', NOW() - INTERVAL '8 days'
FROM drivers WHERE email = 'sarah.brown@email.com';

INSERT INTO payments (driver_id, amount, payment_type, payment_method_type, status, completed_at)
SELECT id, 450.00, 'deposit', 'ach', 'succeeded', NOW() - INTERVAL '12 days'
FROM drivers WHERE email = 'michael.davis@email.com';

INSERT INTO payments (driver_id, amount, payment_type, payment_method_type, status, completed_at)
SELECT id, 450.00, 'deposit', 'credit_card', 'succeeded', NOW() - INTERVAL '15 days'
FROM drivers WHERE email = 'jennifer.garcia@email.com';

INSERT INTO payments (driver_id, amount, payment_type, payment_method_type, status, completed_at)
SELECT id, 450.00, 'deposit', 'credit_card', 'succeeded', NOW() - INTERVAL '18 days'
FROM drivers WHERE email = 'robert.miller@email.com';

INSERT INTO payments (driver_id, amount, payment_type, payment_method_type, status, completed_at)
SELECT id, 450.00, 'deposit', 'ach', 'succeeded', NOW() - INTERVAL '20 days'
FROM drivers WHERE email = 'lisa.wilson@email.com';

INSERT INTO payments (driver_id, amount, payment_type, payment_method_type, status, completed_at)
SELECT id, 450.00, 'deposit', 'credit_card', 'succeeded', NOW() - INTERVAL '22 days'
FROM drivers WHERE email = 'james.anderson@email.com';

INSERT INTO payments (driver_id, amount, payment_type, payment_method_type, status, completed_at)
SELECT id, 450.00, 'deposit', 'credit_card', 'succeeded', NOW() - INTERVAL '25 days'
FROM drivers WHERE email = 'patricia.taylor@email.com';

INSERT INTO payments (driver_id, amount, payment_type, payment_method_type, status, completed_at)
SELECT id, 450.00, 'deposit', 'ach', 'succeeded', NOW() - INTERVAL '28 days'
FROM drivers WHERE email = 'christopher.thomas@email.com';

INSERT INTO payments (driver_id, amount, payment_type, payment_method_type, status, completed_at)
SELECT id, 450.00, 'deposit', 'credit_card', 'succeeded', NOW() - INTERVAL '30 days'
FROM drivers WHERE email = 'elizabeth.jackson@email.com';

INSERT INTO payments (driver_id, amount, payment_type, payment_method_type, status, completed_at)
SELECT id, 450.00, 'deposit', 'ach', 'succeeded', NOW() - INTERVAL '35 days'
FROM drivers WHERE email = 'william.white@email.com';